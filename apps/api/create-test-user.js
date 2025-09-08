const admin = require("firebase-admin");
const path = require("path");

// טוען את קובץ ה-service account מתוך הנתיב במשתנה הסביבה
const serviceAccount = require(path.resolve(__dirname, "../../serviceAccount.json"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL,
  });
}

admin
  .auth()
  .createUser({
    email: "lia@test.com",
    password: "Passw0rd!",
  })
  .then((u) => {
    console.log("CREATED", u.uid);
    process.exit(0);
  })
  .catch(async (e) => {
    if (e.errorInfo?.code === "auth/email-already-exists") {
      const u = await admin.auth().getUserByEmail("lia@test.com");
      console.log("EXISTS", u.uid);
      process.exit(0);
    } else {
      console.error(e);
      process.exit(1);
    }
  });
