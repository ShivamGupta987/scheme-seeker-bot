
// Define a proper return type for the API service
export type ApiResponse = {
  success: boolean;
  data?: { schemes: any[] };
  error?: string;
};
