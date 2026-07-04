-- Seed file for Loan Tracker local database

-- 1. Insert default roles (Integer PKs)
INSERT INTO public.roles (id, name, description)
VALUES
  (1, 'borrower', 'Borrowers applying for loans and uploading KYC docs'),
  (2, 'BankAgent', 'Lending bank agents managing client files and sanctioning offers'),
  (3, 'PropertyOwner', 'Builders or property owners listing real estate properties'),
  (4, 'Admin', 'System administrators managing configurations')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 2. Insert default banks (Integer PKs)
INSERT INTO public.banks (id, name, branch)
VALUES
  (1, 'State Bank of India', 'Corporate Office, Mumbai'),
  (2, 'HDFC Bank', 'Main Branch, Mumbai'),
  (3, 'ICICI Bank', 'Central Branch, Bangalore'),
  (4, 'Axis Bank', 'Regional Branch, Hyderabad')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, branch = EXCLUDED.branch;