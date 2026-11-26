import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LeadForm } from '@/components/forms/LeadForm';
import { LIST_PROPERTY_MESSAGE } from '@/lib/contact';

const submitEnquiry = vi.fn();
vi.mock('@/app/actions/enquiries', () => ({ submitEnquiry: (...args: unknown[]) => submitEnquiry(...args) }));

const consent = { text: 'I agree to be contacted.', version: 'v-test', privacyNote: 'Zero spam.' };
const renderForm = (props: Partial<React.ComponentProps<typeof LeadForm>> = {}) =>
  render(<LeadForm consent={consent} source="contact" whatsapp="919876543210" advisorName="Advisor" intentChoices={['site-visit', 'price-sheet', 'loan-help', 'general']} {...props} />);

const type = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: /schedule|send|unlock/i }));

describe('LeadForm', () => {
  beforeEach(() => {
    submitEnquiry.mockReset();
    submitEnquiry.mockResolvedValue({ ok: true, id: 'e1' });
  });

  it('shows errors and sends nothing when required fields are empty', async () => {
    renderForm();
    submit();
    expect(await screen.findByText(/please enter your name/i)).toBeInTheDocument();
    expect(submitEnquiry).not.toHaveBeenCalled();
  });

  it('rejects an invalid mobile number', async () => {
    renderForm();
    type(/^name/i, 'Asha Rao');
    type(/mobile/i, '12345');
    submit();
    expect(await screen.findByText(/10-digit/i)).toBeInTheDocument();
    expect(submitEnquiry).not.toHaveBeenCalled();
  });

  it('sends a valid enquiry with the consent version and shows the confirmation', async () => {
    renderForm();
    type(/^name/i, 'Asha Rao');
    type(/mobile/i, '98765 43210');
    submit();
    await waitFor(() => expect(submitEnquiry).toHaveBeenCalledTimes(1));
    expect(submitEnquiry.mock.calls[0][0]).toMatchObject({ name: 'Asha Rao', source: 'contact', consentVersion: 'v-test', intent: 'site-visit' });
    expect(await screen.findByRole('status')).toHaveTextContent(/request registered/i);
    const followUp = screen.getByRole('link', { name: /continue on whatsapp/i });
    expect(decodeURIComponent(followUp.getAttribute('href')!)).toContain('My name is Asha');
  });

  it('shows the server message and field errors when the server refuses', async () => {
    submitEnquiry.mockResolvedValue({ ok: false, message: 'Please check the highlighted fields.', fieldErrors: { phone: 'Enter a 10-digit Indian mobile number' } });
    renderForm();
    type(/^name/i, 'Asha Rao');
    type(/mobile/i, '9876543210');
    submit();
    expect(await screen.findByText(/please check the highlighted fields/i)).toBeInTheDocument();
  });

  it('starts with the list-your-property message and its own button', () => {
    renderForm({ intent: 'general', intentChoices: undefined, defaultMessage: LIST_PROPERTY_MESSAGE, submitLabel: 'Send property details' });
    expect((screen.getByLabelText(/message/i) as HTMLTextAreaElement).value).toBe(LIST_PROPERTY_MESSAGE);
    expect(screen.getByRole('button', { name: /send property details/i })).toBeInTheDocument();
  });

  it('shows the consent text under the button', () => {
    renderForm();
    expect(screen.getByText(/i agree to be contacted/i)).toBeInTheDocument();
  });
});
