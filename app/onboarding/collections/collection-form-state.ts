/** Shared form state for collection onboarding (must live outside `"use server"` files). */

export type CollectionFormState = {
  error?: string;
};

export const collectionFormInitialState: CollectionFormState = {};
