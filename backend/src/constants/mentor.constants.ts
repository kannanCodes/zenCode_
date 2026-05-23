export const MENTOR_DEFAULT_BIO = 'Experienced software developer and mentor.';
export const MENTOR_DEFAULT_TITLE = 'Software Engineer';

export const MENTOR_PROFILE_LIMITS = {
  FULL_NAME_MIN: 2,
  FULL_NAME_MAX: 50,
  TITLE_MAX: 80,
  BIO_MAX: 1000,
  EXPERTISE_MAX_ITEMS: 20,
  EXPERTISE_ITEM_MAX: 40,
};

export const MENTOR_EXPERIENCE_MAPPING: Record<string, number> = {
  junior: 1,
  mid: 3,
  senior: 5,
};
