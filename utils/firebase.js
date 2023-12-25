const admin = require('firebase-admin');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    "type": "service_account",
    "project_id": "gigachat-img",
    "private_key_id": "3e34fc3ce136a7c81b02b3390b0dc3166bfe1e14",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCguXp+h2+8MPz6\n9XIgp7lKq1FwtiblVRx2C83L5Ma+nFpqCwacR04RWKq0O3QHJifVi9C7tNRX4Jbi\nUKZ/RA9iyQSMASLzaoNNqv91W+2gJPMqnex3XbVpWsSiwnRAv/Ow69mr/f8RKpQH\nVk3inK9YzOSRiVp/8vQeQkC/GWAx0py39QPlxG0YXtQemSfF1URecwW85+tRNKZN\n9wVNbcJiJY2qy8ECahO98znIudvpPZ7cryAXllot9JCp37A1NO6lzr/Ukcybvm/0\nU0W1KDi43gx/Ruhlh4nFbSUAw4EL4vLGeX6iGTpKkaSt6NpHLaTN/vyH8Lae9kff\nN6bUWa4nAgMBAAECggEAAxEax2fGFl6tT8NA0w2k0z3gMc4+E3jxSJwd6Fw6Fajt\nPwULgay/yFzbSTLuvtjwQGheC/quiaH3+oHS+32lTnbpepWpQLxGwWhnRgvduWzL\n1PFAHJFzbGKx6Jrc/X34WzxnJSGhpwyhjvG2BVGQ7B8XzHq+5s8osvFljOF3OBkU\ncW1ADU/4gOyIvBczSl09mFvPxGAT4ukdjuihZOwR+fyAS0dZFZkFJswaXajr2PUp\nxV8NGwNeixagXY+AZdZNtnhwvXvUT2QH+segSqXszxCnac8kpB+6ZZwDnBc81DWl\nvEr2kst04GETohviucZfhmxcQarHReNk9ymHwnBLsQKBgQDSGHKa+fDYtTmGrAAQ\nNk1vzuIJTSmSR8uuWj+aYem92TNivHzez1EKsO2EHKuneUcdFB+yVoAQZOokU8s1\nuUHLAlsVozBjVlIA4lcQPRA8RCuf2hYsnrOSSNXV2Y6cv3E6zEcEZ2kpt3MDVNov\nl09uPrvzpAFag2Mfne/gXiUVaQKBgQDD13+ImGBc+uPEMML1/6nrLk/j9ZIYb+w4\nm4YlcB/Jd9teFhYS/b5UfccIoUELql9dz18qL3Uh6Kifg/kTJDLAUgMvUkgKJCkn\nPpibDHeXdK4ie6BvThuFFG8hboH1cSp/xWnREWDKaSwth4TIHkvFc+v9UEK6z/oF\nn1FzqoNlDwKBgQC5R54qVim0s32b6qvToFACPmzQzx/ORUq25BgbSiYcqyPJ+3gT\n9rj9uLJ+Q9qNw0KXvluFpwshah2jE9Kt+kavhdBV8KiHsmR3KySkyXU78NKYEnhj\nuUGbzGfoRAik66ArvmMS2y++/m2LjpUsS0BddS3D2+rlq+EKzPny4JPLoQKBgQC0\nCjPzhmnocLndjhpdftleHOhTIFpb3uDiNZAAcPC4DVj9SP6oHN/R2wOUGnKq38jm\nfBL3vENJlhMW+oOLplaF2Z+V7GXP9OhkbLZsq+xxr1G6375hNQQ1ttBngqk01AGH\nDxy1l+1Mh52WiaR3OOrdrjFAYn3GMhae/pUp6ZL73wKBgHYwkCb3w7JKbfLJHkSU\n/WkDrRtg8sppliqRNiUW6yCJjjr4tLepYkAUE+x+yOafGNfJBWXF/DS9qSFeBrxo\nKCPo4H/kNS2xykTR3kRhPhjq9JrCGOCXnFCxypjDhsXnr4h2BBJzDPRx2K39Rg3K\n45V0RbKVcpAdXCx8joxGF1oa\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-5avio@gigachat-img.iam.gserviceaccount.com",
    "client_id": "110836219980501782626",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com",
  }),
  storageBucket: 'gigachat-img.appspot.com',
});

const storage = admin.storage();
const bucket = storage.bucket();

const upload = multer({
  storage: multer.memoryStorage(),
    // limits: { files: 4 }, // Limit to a maximum of 4 files
});

module.exports = { bucket, upload, uuidv4 };

