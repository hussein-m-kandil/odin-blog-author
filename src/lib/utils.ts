import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { UseFormReturn } from 'react-hook-form';
import logger from './logger';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function abbreviateFullName(fullname: string) {
  const names = fullname.split(' ');
  const abbrev = `${names[0][0]}${
    names.length > 1 ? names[names.length - 1][0] : ''
  }`.toUpperCase();
  return abbrev;
}

export function formatDate(date: Date | string) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    day: 'numeric',
    month: 'long',
  });
}

export const isObject = (x: unknown): x is Record<string, unknown> => {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
};

export const isNoneEmptyString = (x: unknown): x is string => {
  return typeof x === 'string' && x.trim() !== '';
};

export const isErrorResponseWithStringError = (
  errRes: unknown
): errRes is { error: string } => {
  return (
    isObject(errRes) && 'error' in errRes && isNoneEmptyString(errRes.error)
  );
};

export const isErrorResponseWithStringErrorMessage = (
  errRes: unknown
): errRes is { error: { message: string } } => {
  return (
    isObject(errRes) &&
    'error' in errRes &&
    isObject(errRes.error) &&
    'message' in errRes.error &&
    isNoneEmptyString(errRes.error.message)
  );
};

export const getUnknownErrorMessage = (
  error: unknown,
  defaultMessage = 'Unexpected error'
) => {
  logger.error(error?.toString() ?? defaultMessage, error);
  return 'Something went wrong';
};

export const getResErrorMessageOrThrow = async (
  res: Response,
  hookForm?: UseFormReturn
) => {
  if (res.status === 401 || res.status === 403) {
    return 'You are unauthorized';
  }
  const resData = await res.json();
  if (hookForm && Array.isArray(resData) && resData.every(isIssue)) {
    const { formErrors, fieldErrors } = parseIssues(resData);
    showFieldErrors(hookForm, fieldErrors);
    if (formErrors.length) return formErrors[0];
  } else if (isErrorResponseWithStringErrorMessage(resData)) {
    return resData.error.message;
  } else if (isErrorResponseWithStringError(resData)) {
    return resData.error;
  } else if (isNoneEmptyString(resData)) {
    return resData;
  }
  throw resData;
};

export type Issue = { path: unknown[]; message: string };
export type FieldErrors = Record<string, string[]>;

export const isIssue = (issue: unknown): issue is Issue => {
  return (
    isObject(issue) &&
    'path' in issue &&
    Array.isArray(issue.path) &&
    'message' in issue &&
    typeof issue.message === 'string'
  );
};

export const showFieldErrors = (
  hookForm: UseFormReturn,
  fieldErrors: FieldErrors
) => {
  Object.entries(fieldErrors).forEach(([fieldName, messages]) => {
    if (messages.length) {
      const inputError = { message: messages[0], type: 'manual' };
      const options = { shouldFocus: true };
      hookForm.setError(fieldName, inputError, options);
    }
  });
};

export const parseOneIssue = (
  issue: Issue
): string | [string, string[]] | undefined => {
  if (issue.message && issue.path.length && typeof issue.path[0] === 'string') {
    return [issue.path[0], [issue.message]];
  } else if (issue.message && !issue.path.length) {
    return issue.message;
  }
};

export const parseIssues = (issues: Issue[]) => {
  const formErrors: string[] = [];
  const fieldErrors: FieldErrors = {};
  for (const issue of issues) {
    const parsedIssue = parseOneIssue(issue);
    if (typeof parsedIssue === 'string') formErrors.push(parsedIssue);
    else if (Array.isArray(parsedIssue)) {
      const [name, messages] = parsedIssue;
      if (Array.isArray(fieldErrors[name])) {
        fieldErrors[name].push(...messages);
      } else fieldErrors[name] = messages;
    }
  }
  return { formErrors, fieldErrors };
};
