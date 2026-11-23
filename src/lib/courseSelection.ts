/**
 * The course picked on the answer sheet and the course in the enquiry form are one choice.
 * Marking a bubble fills the form's select; changing the select marks the bubble.
 * Both sides talk through one window event so neither owns the other.
 */
export const COURSE_EVENT = 'mirror:course';

export function announceCourse(slug: string) {
  window.dispatchEvent(new CustomEvent<string>(COURSE_EVENT, { detail: slug }));
}

/** Put a course into the enquiry form and tell the sheet. */
export function chooseCourse(slug: string) {
  const select = document.getElementById('enquiry-course') as HTMLSelectElement | null;
  if (select) {
    select.value = slug;
    // React listens for 'change' to clear a pending field error
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }
  announceCourse(slug);
}
