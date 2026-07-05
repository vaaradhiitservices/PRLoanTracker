import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../utils/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import {
  FileText, Upload, CheckCircle2, Eye, RefreshCw, User, ShieldAlert, Phone, MapPin, Landmark, Briefcase
} from 'lucide-react';

interface DocumentType {
  id: number;
  name: string;
  code: string;
  is_profile_doc: boolean;
  description: string;
}

interface BorrowerDocument {
  id: string;
  borrower_id: string;
  document_type_id: number;
  doc_number: string | null;
  file_path: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejection_comment: string | null;
}

export default function BorrowerKYC() {
  const profile = useAuthStore(state => state.profile);
  const user = useAuthStore(state => state.user);
  const refreshProfile = useAuthStore(state => state.refreshProfile);

  // Active Tab State (1: General KYC, 2: Income Documents)
  const [activeTab, setActiveTab] = useState<1 | 2>(1);
  const [uploadingCode, setUploadingCode] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Save operations state
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Editable Profile Text State
  const [phoneVal, setPhoneVal] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [cityVal, setCityVal] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [postalCodeVal, setPostalCodeVal] = useState('');
  const [aadhaarNum, setAadhaarNum] = useState('');
  const [panNum, setPanNum] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync text inputs when profile details load (only once on initial load)
  useEffect(() => {
    if (profile && !isInitialized) {
      setPhoneVal(profile.phone || '');
      setAddressLine1(profile.address_line1 || '');
      setAddressLine2(profile.address_line2 || '');
      setCityVal(profile.city || '');
      setStateVal(profile.state || '');
      setPostalCodeVal(profile.postal_code || '');
      setAadhaarNum(profile.aadhaar_number || '');
      setPanNum(profile.pan_number || '');
      setIsInitialized(true);
    }
  }, [profile, isInitialized]);

  // Fetch document types registry from database
  const { data: docTypes, isLoading: isLoadingTypes } = useQuery<DocumentType[]>({
    queryKey: ['documentTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_types')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch already uploaded borrower documents
  const { data: borrowerDocs, isLoading: isLoadingDocs, refetch } = useQuery<BorrowerDocument[]>({
    queryKey: ['borrowerDocuments', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('borrower_documents')
        .select('*')
        .eq('borrower_id', user!.id);
      if (error) throw error;
      return data || [];
    }
  });

  const getDocByCode = (code: string) => {
    const type = docTypes?.find(t => t.code === code);
    if (!type) return null;
    const doc = borrowerDocs?.find(d => d.document_type_id === type.id);
    return { type, doc };
  };

  // Save Textual Profile details to database (phone, address, Aadhaar, PAN)
  const saveProfileDetails = async () => {
    if (!user?.id) return;
    setIsSavingProfile(true);
    setUploadError(null);
    setSaveSuccessMsg(null);

    // Aadhaar format check: 12 digits numeric
    if (aadhaarNum && !/^\d{12}$/.test(aadhaarNum)) {
      setUploadError('Aadhaar number must be exactly 12 digits.');
      setIsSavingProfile(false);
      return;
    }

    // PAN format check: 10 chars alphanumeric
    if (panNum && !/^[A-Z]{5}\d{4}[A-Z]{1}$/i.test(panNum)) {
      setUploadError('PAN number format is invalid (e.g. ABCDE1234F).');
      setIsSavingProfile(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          phone: phoneVal || null,
          address_line1: addressLine1 || null,
          address_line2: addressLine2 || null,
          city: cityVal || null,
          state: stateVal || null,
          postal_code: postalCodeVal || null,
          aadhaar_number: aadhaarNum || null,
          pan_number: panNum.toUpperCase() || null
        })
        .eq('id', user.id);

      if (error) throw error;

      // Sync Zustand cache
      await refreshProfile();
      setSaveSuccessMsg('Profile address and contact details saved successfully!');
    } catch (err: any) {
      console.error('Failed to save profile details:', err);
      setUploadError(err.message || 'Failed to save address details.');
    } finally {
      setIsSavingProfile(false);
    }
  };



  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    code: string
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id || !docTypes) return;

    setUploadingCode(code);
    setUploadError(null);
    setSaveSuccessMsg(null);

    const type = docTypes.find(t => t.code === code);
    if (!type) {
      setUploadError('Invalid document type');
      setUploadingCode(null);
      return;
    }

    try {
      // 1. Create storage folder path: kyc/{user_id}/{code}_filename
      const fileExt = file.name.split('.').pop();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
      const storagePath = `${user.id}/${code}_${sanitizedName}.${fileExt}`;

      // 2. Upload file to Supabase storage bucket 'kyc'
      const { error: storageErr } = await supabase.storage
        .from('kyc')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (storageErr) throw storageErr;

      // 3. Upsert record in borrower_documents
      const { error: dbErr } = await supabase
        .from('borrower_documents')
        .upsert({
          borrower_id: user.id,
          document_type_id: type.id,
          doc_number: null, // Identity numbers are saved cleanly on user_profiles now!
          file_path: storagePath,
          status: 'PENDING',
          rejection_comment: null
        }, {
          onConflict: 'borrower_id,document_type_id'
        });

      if (dbErr) throw dbErr;

      await refetch();
      await refreshProfile();
      setSaveSuccessMsg(`File uploaded successfully for ${type.name}!`);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Failed to upload document.');
    } finally {
      setUploadingCode(null);
    }
  };

  // Simple borderless file uploader row
  const renderDocRow = (code: string, label: string, desc: string) => {
    const data = getDocByCode(code);
    if (!data) return null;
    const { doc } = data;

    const isUploading = uploadingCode === code;
    const hasDoc = !!doc;
    const status = doc?.status;

    return (
      <div className="border-b border-slate-900 pb-3.5 last:border-0 last:pb-0 space-y-2 text-xs">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              {label}
              {hasDoc && (
                <span className={`text-[9px] font-bold uppercase shrink-0 ${status === 'VERIFIED' ? 'text-green-400' :
                    status === 'PENDING' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                  • {status === 'PENDING' ? 'Pending' : status}
                </span>
              )}
            </span>
            <p className="text-[10px] text-slate-500">{desc}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hasDoc && (
              <button
                type="button"
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800/40 text-slate-300 p-1.5 rounded-lg text-xs"
                onClick={async () => {
                  const { data, error } = await supabase.storage
                    .from('kyc')
                    .createSignedUrl(doc.file_path, 604800);
                  if (data?.signedUrl) {
                    window.open(data.signedUrl, '_blank');
                  } else if (error) {
                    console.error('Error generating signed URL:', error);
                  }
                }}
                title="View document"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            )}

            <label className="cursor-pointer bg-slate-900 border border-slate-800 hover:bg-slate-855 text-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5">
              {isUploading ? (
                <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />
              ) : (
                <Upload className="h-3 w-3" />
              )}
              <span>{hasDoc ? 'Replace' : 'Upload'}</span>
              <input
                type="file"
                className="hidden"
                accept="application/pdf,image/*"
                disabled={isUploading}
                onChange={e => handleFileUpload(e, code)}
              />
            </label>
          </div>
        </div>

        {status === 'REJECTED' && doc?.rejection_comment && (
          <div className="bg-red-500/5 border border-red-500/15 p-2 rounded-lg text-[10px] text-red-400">
            <strong>Rejection Reason:</strong> {doc.rejection_comment}
          </div>
        )}

      </div>
    );
  };

  if (isLoadingTypes || isLoadingDocs) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-500 text-xs">
        <RefreshCw className="h-5 w-5 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Notifications */}
      {uploadError && (
        <div className="bg-red-950/20 border border-red-900/40 p-3.5 rounded-xl text-xs text-red-400 flex gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}

      {saveSuccessMsg && (
        <div className="bg-green-950/25 border border-green-900/40 p-3.5 rounded-xl text-xs text-green-400 flex gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex justify-around bg-slate-950 border border-slate-900 rounded-xl p-1 shrink-0">
        <button
          type="button"
          className={`flex-1 py-2.5 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 1 ? 'bg-slate-900 text-blue-400 border border-slate-800' : 'text-slate-500 hover:text-slate-300'
            }`}
          onClick={() => { setActiveTab(1); setUploadError(null); setSaveSuccessMsg(null); }}
        >
          <User className="h-3.5 w-3.5" />
          <span>General KYC</span>
        </button>
        <button
          type="button"
          className={`flex-1 py-2.5 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 2 ? 'bg-slate-900 text-blue-400 border border-slate-800' : 'text-slate-500 hover:text-slate-300'
            }`}
          onClick={() => { setActiveTab(2); setUploadError(null); setSaveSuccessMsg(null); }}
        >
          <Landmark className="h-3.5 w-3.5" />
          <span>Income Documents</span>
        </button>
      </div>

      {/* TAB 1: General KYC (Unified Contact details, Identity stack, and Address inputs) */}
      {activeTab === 1 && (
        <div className="space-y-5">

          {/* Card 1: Contact Information */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
            <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              Contact Information
            </span>
            <div className="space-y-1.5 text-xs">
              <label className="text-[10px] text-slate-500 font-semibold">Registered Phone Number</label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="e.g. +91 9876543210"
                value={phoneVal}
                onChange={e => setPhoneVal(e.target.value)}
              />
            </div>
          </div>

          {/* Card 2: Identity Documents Inputs & Upload Rows */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
            <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              Identity Details
            </span>

            <div className="space-y-4 text-xs">
              {/* Aadhaar Number input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-semibold">Aadhaar Number (12 Digits)</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 567890123456"
                  value={aadhaarNum}
                  onChange={e => setAadhaarNum(e.target.value.replace(/\D/g, '').slice(0, 12))}
                />
              </div>

              {/* Aadhaar Card Uploader */}
              {renderDocRow('AADHAAR', 'Aadhaar Card File', 'Upload card proof copy (PDF/Image)')}

              {/* PAN Number input */}
              <div className="space-y-1.5 border-t border-slate-900 pt-3">
                <label className="text-[10px] text-slate-500 font-semibold">PAN Card Number (10 Chars)</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. ABCDE1234F"
                  value={panNum}
                  onChange={e => setPanNum(e.target.value.toUpperCase().slice(0, 10))}
                />
              </div>

              {/* PAN Card Uploader */}
              {renderDocRow('PAN', 'PAN Card File', 'Upload card proof copy (PDF/Image)')}

              {/* Passport Photo Uploader */}
              <div className="border-t border-slate-900 pt-3">
                {renderDocRow('PHOTO', 'Passport Size Photograph', 'Upload recent colored passport photo')}
              </div>
            </div>
          </div>

          {/* Card 3: Address Details & Proof File Stack */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
            <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              Residential Address
            </span>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-semibold">Address Line 1</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Apartment, Suite, Street name"
                  value={addressLine1}
                  onChange={e => setAddressLine1(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-semibold">Address Line 2</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Landmark, Area"
                  value={addressLine2}
                  onChange={e => setAddressLine2(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-semibold">City</label>
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Mumbai"
                    value={cityVal}
                    onChange={e => setCityVal(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-semibold">State</label>
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Maharashtra"
                    value={stateVal}
                    onChange={e => setStateVal(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-semibold">Postal Code</label>
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 400001"
                    value={postalCodeVal}
                    onChange={e => setPostalCodeVal(e.target.value)}
                  />
                </div>
              </div>

              {/* Address Proof File Row aligned inside this same card stack */}
              <div className="border-t border-slate-900 pt-4 mt-2">
                {renderDocRow('ADDRESS_PROOF', 'Address Proof Document File', 'Upload Aadhaar, Passport, DL, or Utility Bill copy')}
              </div>
            </div>
          </div>

          {/* Unified Save profile trigger */}
          <button
            type="button"
            className="w-full bg-slate-100 hover:bg-white text-slate-950 font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 mt-4"
            onClick={saveProfileDetails}
            disabled={isSavingProfile}
          >
            {isSavingProfile ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-slate-950" /> Saving Profile...
              </>
            ) : (
              'Save Contact & Address details'
            )}
          </button>

        </div>
      )}

      {/* TAB 2: Income Documents (Financial proof upload checklist) */}
      {activeTab === 2 && (
        <div className="space-y-5">

          {/* Income Document Stack Checklist grouped inside a single container */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
            <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              Income Proof Documents
            </span>

            <div className="space-y-4">
              {renderDocRow('EMPLOYEE_ID', 'Employee ID Card', 'Upload photographic employee corporate identity card')}
              {renderDocRow('OFFER_LETTER', 'Employment Offer Letter', 'Upload company letter specifying designation and compensation')}
              {renderDocRow('FORM16_1', 'Form 16 (Latest Year)', 'Income Tax salary TDS certificate')}
              {renderDocRow('FORM16_2', 'Form 16 (Previous Year)', 'Income Tax salary TDS certificate')}

              <div className="border-t border-slate-900 pt-4 mt-2">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Monthly Payslips (Past 6 Months)</h5>
                <div className="space-y-4">
                  {renderDocRow('PAYSLIP_1', 'Payslip Month 1', 'Latest payslip copy')}
                  {renderDocRow('PAYSLIP_2', 'Payslip Month 2', 'Payslip copy')}
                  {renderDocRow('PAYSLIP_3', 'Payslip Month 3', 'Payslip copy')}
                  {renderDocRow('PAYSLIP_4', 'Payslip Month 4', 'Payslip copy')}
                  {renderDocRow('PAYSLIP_5', 'Payslip Month 5', 'Payslip copy')}
                  {renderDocRow('PAYSLIP_6', 'Payslip Month 6', 'Oldest payslip copy')}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
