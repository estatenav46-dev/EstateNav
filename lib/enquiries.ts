export interface EnquiryDraft {
  name: string;
  phone: string;
  message: string;
  propertyId?: string;
  propertyName?: string;
}

export interface SavedEnquiry extends EnquiryDraft {
  createdAt: string;
}

const ENQUIRIES_KEY = 'estatenav_enquiries';

/** Local persistence seam for the later Firebase lead-save implementation. */
export function saveEnquiry(draft: EnquiryDraft): void {
  const parsed: unknown = JSON.parse(localStorage.getItem(ENQUIRIES_KEY) || '[]');
  const existing = Array.isArray(parsed) ? parsed as SavedEnquiry[] : [];
  const enquiry: SavedEnquiry = { ...draft, createdAt: new Date().toISOString() };
  localStorage.setItem(ENQUIRIES_KEY, JSON.stringify([...existing, enquiry]));
}
