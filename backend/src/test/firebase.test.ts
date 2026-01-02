import admin from "../config/firebase";

(async () => {
  const users = await admin.auth().listUsers(1);
  console.log("Firebase connected ✅", users.users.length);
})();
