import { createClient } from '@supabase/supabase-js';

type ContactCopy = {
  processing: string;
  success: string;
  savedPartial: string;
  savedOnly: string;
  error: string;
  configError: string;
  submit: string;
  submitting: string;
  validation: {
    name: string;
    email: string;
    message: string;
  };
};

type ContactResult = {
  ok?: boolean;
  saved?: boolean;
  emailSent?: boolean;
  telegramSent?: boolean;
  error?: string;
};

function getElements() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('contact-submit');
  const statusEl = document.getElementById('contact-status');
  const copyEl = document.getElementById('contact-form-copy');

  if (!(form instanceof HTMLFormElement) || !statusEl || !copyEl) {
    return null;
  }

  let copy: ContactCopy;
  try {
    copy = JSON.parse(copyEl.textContent ?? '{}') as ContactCopy;
  } catch {
    return null;
  }

  return {
    form,
    submitBtn,
    statusEl,
    copy,
    supabaseUrl: form.dataset.supabaseUrl ?? '',
    supabaseAnonKey: form.dataset.supabaseAnonKey ?? '',
    contactFunction: form.dataset.contactFunction ?? 'rapid-action',
    isConfigured: form.dataset.isConfigured === 'true',
  };
}

function setStatus(
  statusEl: HTMLElement,
  state: 'idle' | 'processing' | 'success' | 'warning' | 'error',
  message: string,
  details = '',
) {
  statusEl.className = `form-status form-status--${state}`;
  statusEl.innerHTML = details
    ? `<strong>${message}</strong><span class="form-status__detail">${details}</span>`
    : message;
  statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildDetail(result: ContactResult) {
  const parts: string[] = [];
  if (typeof result.saved === 'boolean') {
    parts.push(result.saved ? 'Database: saved' : 'Database: not saved');
  }
  if (typeof result.emailSent === 'boolean') {
    parts.push(result.emailSent ? 'Email: sent' : 'Email: failed');
  }
  if (typeof result.telegramSent === 'boolean') {
    parts.push(result.telegramSent ? 'Telegram: sent' : 'Telegram: not sent');
  }
  return parts.join(' · ');
}

async function parseInvokeResponse(data: unknown, error: unknown): Promise<ContactResult> {
  if (data && typeof data === 'object') {
    return data as ContactResult;
  }

  const fnError = error as { context?: Response; message?: string } | null;
  if (fnError?.context && typeof fnError.context.json === 'function') {
    try {
      const body = await fnError.context.json();
      if (body && typeof body === 'object') {
        return body as ContactResult;
      }
    } catch {
      /* response body may be empty */
    }
  }

  return {
    ok: false,
    saved: false,
    emailSent: false,
    error: fnError?.message ?? 'Submission failed',
  };
}

function applyQueryPrefill(form: HTMLFormElement) {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const subject = params.get('subject');
  const typeEl = form.querySelector('#contact-inquiry-type');
  const subjectEl = form.querySelector('#contact-subject');

  if (type && typeEl instanceof HTMLSelectElement && ['client', 'professional', 'general'].includes(type)) {
    typeEl.value = type;
  }

  if (subject && subjectEl instanceof HTMLInputElement) {
    subjectEl.value = subject;
  }
}

function initContactForm() {
  const ctx = getElements();
  if (!ctx) return;

  const { form, submitBtn, statusEl, copy } = ctx;
  applyQueryPrefill(form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!ctx.isConfigured) {
      setStatus(statusEl, 'error', copy.configError);
      return;
    }

    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      inquiryType: String(data.get('inquiryType') ?? '').trim(),
      subject: String(data.get('subject') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
      website: String(data.get('website') ?? '').trim(),
    };

    if (!payload.name) {
      setStatus(statusEl, 'error', copy.validation.name);
      return;
    }

    if (!isValidEmail(payload.email)) {
      setStatus(statusEl, 'error', copy.validation.email);
      return;
    }

    if (!['client', 'professional', 'general'].includes(payload.inquiryType)) {
      setStatus(statusEl, 'error', 'Please select how you are reaching out.');
      return;
    }

    if (payload.message.length < 10) {
      setStatus(statusEl, 'error', copy.validation.message);
      return;
    }

    if (submitBtn instanceof HTMLButtonElement) {
      submitBtn.disabled = true;
      submitBtn.textContent = copy.submitting;
    }

    setStatus(statusEl, 'processing', copy.processing);

    try {
      const supabase = createClient(ctx.supabaseUrl, ctx.supabaseAnonKey);
      const { data: result, error } = await supabase.functions.invoke(ctx.contactFunction, {
        body: payload,
      });

      const response = await parseInvokeResponse(result, error);
      const detail = buildDetail(response);

      if (response.ok && response.saved) {
        setStatus(statusEl, 'success', copy.success, detail);
        form.reset();
        applyQueryPrefill(form);
        return;
      }

      if (response.saved && !response.emailSent) {
        setStatus(statusEl, 'warning', copy.savedPartial, detail || response.error || '');
        return;
      }

      if (response.saved) {
        setStatus(statusEl, 'warning', copy.savedOnly, detail || response.error || '');
        return;
      }

      setStatus(statusEl, 'error', response.error ?? copy.error, detail);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : copy.error;
      setStatus(statusEl, 'error', copy.error, message);
    } finally {
      if (submitBtn instanceof HTMLButtonElement) {
        submitBtn.disabled = false;
        submitBtn.textContent = copy.submit;
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContactForm);
} else {
  initContactForm();
}
