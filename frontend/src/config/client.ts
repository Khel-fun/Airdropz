import { createThirdwebClient } from "thirdweb";

const clientId = import.meta.env.VITE_CLIENT_ID;
const secretKey = import.meta.env.VITE_SECRET_KEY!;

export const client = createThirdwebClient({
  clientId: clientId,
  secretKey: secretKey
});