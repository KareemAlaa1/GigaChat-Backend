const admin = require('firebase-admin');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');



// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    "type": "service_account",
    "project_id": "tempgigachat",
    "private_key_id": "f61ce8ab6117a5438bec04c46ed03ffc0085576b",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCqYY50+FZDiwVv\nSu+4w9RkQx+eT/0Y3FFaiOwrAOyBCWtLxskOzWmm4xUaHM3pAWMECcESZUYivZYJ\nJCUcosMQ0uuQOqEV5Pfo/bnuVQZcledqO1XzVjyE7kbKXLqYHascNlJk8gBMeFup\n8n4iyuk98x5PISXNn6vXF3nb0q3000Q62G2iiAhq+ULKrsYoazdPWqZQOhrnedwS\nbAGNgO0D2qPoJvYY6aztSOg4WPLFuqyj0pHO1/18d8W0o/5Ma51m/7B+f1RyG1Yl\nO3GiExL7LkEE9xkf60XQIvkyuALnW68rPnt4alr4i3Jg0nstVlnTB0sHXIRHIZfW\nf/r2IObFAgMBAAECggEAB1NT9mwB+3vz8x3H8kv7Kwdmyd37DhFU7x1ReCTdRkwD\nILouhVQoHXyIePuxj7nXScJomnOfwRkhJQn4jYNi+ytyZNxcdi5GyW31S029DQiF\n71+XObPkvLto8ETt4eHurDMatkvgXulS2Zr7OOA8CIWWMUVF1JIvp3sTKnQjthG4\nOWyRGqazABL79z06tT++a7xVfhxJZKcNBhK/e+VRNtbTX9zXp8ShOeaZdsxLt74k\n3xU+NH4rPqO0hCn17pyPEOPuhyJeRxZi+QOkRuRyjniexOKFoIxolUJoCReVIvTW\nFOkcbNSvrH7zGfr1nhS7m3GrjjZh3NZt/2mjbiFqIQKBgQDqzmVPFadwCf6N2xcJ\nuWHZPkyn0mDR6Zjsr5R1XQrp6Gt8sVMvhNXTxv2Qqbtmna4RqeAnSQCFB1hqUglj\nngOY4On05zEVtqxmmna64CHHdoNesqGvJMTHNJ1IT5y17R4iMCJU6FyClecfpgSI\nRHA8EATnf4hfm2ZCIlqTBUpbZQKBgQC5woGP9cMIGkwhPBKqGy8Z7dN8qxFotG3s\nIHjfvOocn18Nh/v/wpdEYCkaVOxQtm2I5hXSjOTq+NFkKhKuEl4k3zYm4cqhW1Gs\n+pMsOhj08Wy946YRO/5B8rgQjhpwhSJEzHwskHPq8rkS+vDfcN+aaw++gef8235j\nO3tA2YaX4QKBgAvAaLGck9S3q1XOMUj7TjphM9TyYoYe+thdsUBud61dRIPpHBC0\nxT7kJqym0gpAugWISv+sV6pQw8wObwndTrDIEO2A5KQBkH9SG78emJIzDEAhEJaD\ncJXHvFdyJJW2WFu9rPoy5u5iMj8TQAbR5gwbgSNU7q5aSLPmpEHXcfFBAoGAcHVs\n8raaiEFDbatssUcb0NrGemcmdvkkwxs1kl5QbVuetBZrXX91DJQazjIzjvmifoqt\nE3bw78ALJFTEUlYUYMYxhoCTp/QdElfw2YmiqkeuyZcUZsKnP02uWXduUkiHYpdZ\nZbFePBMOMItzYBJ5jIbcVT1YMSDA91p/V9dZQIECgYEA4LmiwVFXxUXqgqupvSGc\nfHGofUagTf3JcKFP76BPreZ63SRss2g8JZNXsj8S3l22hn6ldPZRTZvRi5bWCByT\n9g5obkC2zCuynbKfU03fJiinLodmYDJ7NhVcr3r4uxeaXAcgrPeQUDmU57mli3vT\nOIrvKi1mxhZXLorH3V0RZ30=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-5ryru@tempgigachat.iam.gserviceaccount.com",
    "client_id": "108294213973911993423",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-5ryru%40tempgigachat.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  }),
  storageBucket: 'tempgigachat.appspot.com',
});

const storage = admin.storage();
const bucket = storage.bucket();

const upload = multer({
  storage: multer.memoryStorage(),
    // limits: { files: 4 }, // Limit to a maximum of 4 files
});

module.exports = { bucket, upload, uuidv4 };

