interface FormSubmitPayload {
  _subject: string;
  _template: 'table' | 'box';
  _captcha: 'false';
  _replyto?: string;
  [key: string]: string | undefined;
}

const FORMSUBMIT_ENDPOINT = process.env.FORMSUBMIT_ENDPOINT;

export async function sendFormSubmitEmail(payload: FormSubmitPayload): Promise<void> {
  if (!FORMSUBMIT_ENDPOINT) {
    console.warn('[FormSubmit] FORMSUBMIT_ENDPOINT not configured, skipping email notification');
    return;
  }

  try {
    const response = await fetch(FORMSUBMIT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[FormSubmit] HTTP ${response.status}: ${text}`);
    } else {
      console.log('[FormSubmit] Email notification sent successfully');
    }
  } catch (error) {
    console.error('[FormSubmit] Failed to send email notification:', error);
  }
}
