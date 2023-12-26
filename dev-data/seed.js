const fs = require('fs');
const faker = require('faker');

const mediaTweet = [
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/b2c03cb7-a764-484e-94fd-3dd568c21d91-ai_artificial_intelligence_ml_machine_learning_vector_by_kohb_gettyimages_1146634284-100817775-large.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=ZaQXUUAQTeNpA3sJqy7i1cFh24g4xjQRZjnU8EZtLG9hn2ddzYTGgR6nEOGCY93%2Fs7LtseliOKRmRcNRcQDyChDSV5I9qKjOIgRzl4RZTUcgny0%2Fpa6yMkS9AxoBlDgcyC4wcneWrCX%2BkSunrfARYwr52KUipi%2BgHwgTbFiXN4NUX3%2FzZHGSx7QVdvW2E5LKvtcM1njYYAMEZ9H4egUFEnrTsu6cV%2Fx%2Bl4PV1VPdOfYUBb48R%2BGCkPkYJB6WEOEbJUhYBAhshVUHoduy%2BMavYurUXhO6pIpchZhrSli4rrjfe0CyFxkgi7PjWmbBxNOVOUk7%2F4zZl77XP3QTD6dYUg%3D%3D',
    type: 'jpg',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/942108b8-5189-4fb0-bb76-bcbfd205cc81-furina-popcorn-furina.gif?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=iAAjXb%2FwKeFQaEscPcNtZx5U2DAg5Br3VGFF8xqwa01Bapf9DIkPMEDoZpnyMcMkIRuvf36ar8BapnNiJaz4C1IcCqtnBRNjGghvrc7963w2WgWmIEIAqE7c50SWEnBkU5jp13TRQrc1asS2ehDGIZF%2FT9JfiQyAazMcLiDqc0ys18dX0kTrYp2e9fyxn2KIsNTjB53UgWpZh1xlth9fmGR3%2B18gjtvC5GB6opiDvokPd0pbPHKhsNNARk2cdGqvhrAcAegWkUpI9XKifW0WF%2FFppRormR13HAZRxyAfI9OmWjWzUuxEjRfRVfTaKkeoYW7f0SbXqqfTJEhqHIAcEQ%3D%3D',
    type: 'jpg',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/942108b8-5189-4fb0-bb76-bcbfd205cc81-furina-popcorn-furina.gif?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=iAAjXb%2FwKeFQaEscPcNtZx5U2DAg5Br3VGFF8xqwa01Bapf9DIkPMEDoZpnyMcMkIRuvf36ar8BapnNiJaz4C1IcCqtnBRNjGghvrc7963w2WgWmIEIAqE7c50SWEnBkU5jp13TRQrc1asS2ehDGIZF%2FT9JfiQyAazMcLiDqc0ys18dX0kTrYp2e9fyxn2KIsNTjB53UgWpZh1xlth9fmGR3%2B18gjtvC5GB6opiDvokPd0pbPHKhsNNARk2cdGqvhrAcAegWkUpI9XKifW0WF%2FFppRormR13HAZRxyAfI9OmWjWzUuxEjRfRVfTaKkeoYW7f0SbXqqfTJEhqHIAcEQ%3D%3D',
    type: 'jpg',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/f2a6a1c6-5dc8-4b4f-bd4a-0808a513a8ff-Screenshot_20231225-011825_WhatsApp.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=mMCy%2FhGr5b05TMEy%2By4l%2BUL7H0dYRh5W2%2BRQDwwV5KTScOSQzShXVmzkM73%2FWSRWoBr1m6bERVbRp5yHkIbgstQpT9H5Op3c169A%2FTgVmv%2B4YjhR0gJRMbs2UM2oVZ4Mrb3YODjfuZ9hcvfQTZ2nYgCwFKQmwR%2FNOiMAMLg8rdic9WdLO8ifAwRiQKuQJEZGbjR%2ByqZxiENzHp54Y3SsXRMaYNYBPaXSabZeBesqxAMDlpZetp3ACEk5JhJobWA5w4M6hpwXAytovn3xlUGlyNIxm9sOmRE8hZ7ZLrJoSq3XGFofPpEj0HuKp%2B944hfv8%2FJ3NbYETyi4mujvGMc73w%3D%3D',
    type: 'jpg',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/5c45f235-38a5-460f-800f-5a063b4820d3-WhatsApp%20Image%202023-11-19%20at%2018.25.38_91c9184e.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=VLasj%2BeyxPHI3r9QqqA9q8EaJOTIWl1ZsLzTE8FaXvJAUiTr4EYQbfNQzvn76BMhB5Dip2C2GQ0VfFHmWMd%2FSfSx%2BITw4ILBokMycfQ%2FHe2%2FDO4L89xaeU985I5M%2FMcJ7Y45J%2B8Exn9QUAaTFhC%2BqBhdER3%2BXH%2FDRuCgweCoDDl0AaPgsBRtaDG8x%2FgiFfW3cpVjPFM7AEri0ychmpOTwAqW2uSZB1Be2RUmHsxB2tue3uXs2ZpasQRE2by7ltnvYUeQBDrruFuqqzYS5ws2ZN8shXm1FJ1H0PNKSUyqyWZpkvr4cEhuhmyTUx60k9GXLnQ9WbbntZWCeipbns%2Fpgg%3D%3D',
    type: 'jpg',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/49c2d6f1-848f-4cc7-94cd-b74ff470b0f0-git.png?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=ktX7DnQuS6iDsGmh8QHTCpzw0vY%2B%2B7y6j6OSH%2FqKuXbrZE2E1%2F95mi9Ol2gM1rjEPnD9eXRg5UaiOCy4E8iSmHUqF0NiwcoHybxIoZPjPbtPfHmTiX5xab%2BzoVlheTE1AwDdjJ0UeuqK4kpgntSgG9UsfB2wEIDVN0c0Rp61bNM71ouLSmrOtau9Iv03imWFnPrgQyJwO52HliSxhkJcgrkzeBZ9VT14VtXGHTMQejuuYedACGyw2wYGVsNFo74Ov47yhZWQCZkiy3jCCQhJv0zXizoEYw2wnlcJjY3wQabu4Gxhntl35wzWYNEe%2B57z7J8zRXGXx%2Ba40Wtg3W5eZA%3D%3D',
    type: 'jpg',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/cd4ca999-b443-41ac-b747-a809ff887aa0-ai_artificial_intelligence_ml_machine_learning_vector_by_kohb_gettyimages_1146634284-100817775-large.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=kjnfVjW3JZH2DlgAX1sr1R%2Bl0YT95mEZoPS0jV9eL9Metv%2FznWGtjXB2vJ%2BpLHqGWytEUsuYiak5Gs%2FHzY%2FsYuQ4fTpBR9YMUoSjTpbyrFzAeQrwWzMaUMmTfTsHu331RXzr6ALQx5yL3RMDQLGCfg5jBQfc5HnDu03sOZ95F7QqgfI6%2FtMV7VAPxGaJBap4B00pCCVxped5uG4Z8VJMeJdnTDkbTlXvp4U3LxmbjvlH%2BxXXHg54lBYwgRz%2B%2B80OtvSFZFvEvwMOOLQnEdRoQPSfWZur4ac9vteVznAw%2BVugXfF%2Bz2PLSah2bXBAXgw%2F7rToLHYxgjhsW4UheEH48Q%3D%3D',
    type: 'jpg',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/a63d3c7b-deca-4089-8dfd-ad898315c128-image_cropper_1703578033016.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=WbK2OvKCvMRuhygpYe5UASbm%2FMTdhU341jVUL8n7PS9o5qgOCuq3Hs4NKtXGCyzNuuyBbKGK4EerkZfJhpcIoStcximdxryDF%2FbvlIk%2FuJjAqqHYPoQgCGW64HnimO5DC5KSdPON03vVrkxAEHaRwPC%2Ba9MyYAqnNDQaGYuD%2Fc863z%2FeCM4YANjquKptoAKRK0tnKExeM3vy2ZBeS0IyY6okK2UXcsaZ%2F4w1wR%2FykXGRXbCgIcf8GjA7%2FGACo3yCrpYCi6kzMetVFA%2FBuYCX%2FoC4REbzOMJj5BhN8vZ1HFedIQJEZ4eaNcS3nEtY4hnTiMiqjjnNGFgHs0%2Fu9YJiKQ%3D%3D',
    type: 'jpg',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/270e085e-ddeb-4f03-b64f-cb3869b517df-1670829080348.mp4?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=NIoy3NWcXI0DnDeEbo2a2eMaZdW%2FXmTregyiLJQqSMHcX1yTM%2FAS3tHdNW4wB8apvFVrEnsip%2FyjxgTx2dYRf8Uyy1eIrsZIYgzvmR5%2F43Tg%2Byr4RlM8THre5IFJ58Q%2BimPSpxKVHUHLmNFoeF8P3Ul5llKWqrUe%2FipyY8MgqaHlI6WjXy5FV%2BrnHuyw%2FPGEBUx%2FQ6SZpngguyNbw8SWSFAscK8d4LAgS0A%2B63F21e7Gh0vp7QWEQgNvuAIVC3QPLKMUVtv1Mp06NLJ1nOZb4DeI47oks%2BKhJWh4thQ4uBbl7cxo%2B8JfB36sjXpbU9aV4RhAB34ZWRdhUgwXgICviA%3D%3D',
    type: 'mp4',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/78729d92-8d9d-4841-b378-f2eaa499b897-Approved_Knuckles_Meme_Template_-_All_Stamp_Scenes_-_Sonic_Boom_online-video-cutter.com.mp4?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=Xw2BFnao3ecxbjchTIMXoiuICmMNZozgv%2BtmX5mpqNr62Br0uBUTuZ0CbouWXGxJ4QQHcRXJzrQmq8y5fW3h2vFQ5RFKpAPH4KtTCqro8X3XQcrMKUSep5%2Ft59W8yycHDbAARlmNQz%2BmEvBtiyHGW7kahpMFve1a9%2FI5K0u2rPWuTDds0z3mTe8WMjgfRelZEaZc46d1BymbrgDx%2B6jTcnARqKPNT8oVQB63Pc12u1OkVo7UxHowvpp6x%2BV70rGIKaUO41nYN5arCX7pCh8mIHxumK5ZJ6L8K8QgneAP%2BT3kHZxKASQdBrZro%2FxapPCWF6ddKUC9dZim2nYdV4AxwQ%3D%3D',
    type: 'jpg',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/4a0293da-6722-40f3-bdde-4b1cd1997e5c-are%20ya%20winnin%20son.png?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=QcUZd9L89PLscATGP6zKfyiCsg8jgrf7X8ErnB9VdY3YeBhH42DHbo3xNG1onaZM7jiue1fiomEYjI51wJgpHwtKxk4N8%2B7zDaQ0tG2HvIxipDB6jOiPk3oUiXtpRWVhtB0e90S4aKsNPRiOeE1I9bKtCTJSHf0%2FKSosUoxucC%2FrX8gh5%2BplGYZcmW6tP%2Bd0gT3DTo5Wy2lTIVTNqizwQAKBYH3diNpPanossq7KKUQpp%2BRPnyXxQMDOWdw0FQVPYJkZ1FhJs%2BVY428m%2F4nHVmJXVEx4lwoQNtybyqnr8N6ab%2BwIXIGFoUXGpNYptIuDqKP3biyjhQrdZUJ7ZInpGA%3D%3D',
    type: 'jpg',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/2670f34b-c2c3-4b3d-861d-a2ec76191d69-u%20good.png?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=FxxzBAwoW%2B9BImKIq%2BArC%2BRkXulBO%2BXxetshMtp46IHXolpvGEl5KFGyEkPqi06zuQ9fAX9adGI2BsfKE2UzSidhAqsLvROP9aw026811vfbcmL2xTklN%2Fr3s0ov4QiP7QzdiEnqR8Nzh222275w3zRG2bCxD2iPeukqfddSbyLVWX8CUGvUZhEVNTZnCYzm%2FbzPwfYmOLeOM9%2BCvlJANLAOcTHCXsrTUb7UzEsvFzKeuENJoANOW1JtEA75nTf1v%2BlRKg0Hk3qXkk2VL3AaRN3rP%2FOmQkzbsHpUieRWbp8uYED66Kbb%2Fc%2BsFb9byq0Lp%2BFXm%2Fwh2Mrj2QN2OD2U4w%3D%3D',
    type: 'jpg',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/ad7c3237-d932-423b-8513-9bdc7b7259c3-videoplayback.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=Z%2Brb77gWHbhG6%2B3Ro5MpDyVyAWQOdPqhAZT2X0NvQwA1s1WRpKUw%2FxPMq2XemD6TFNzCTVtS9yNwkj5gITzylanZHBA9gKi396YPRbxcNxAeTol9lrUXOlGcg19jeXWyJG8VN9XSCleWfagPGnPP9dXTedC6Qi8tHELSsfBrQw7eGIIp2mYsqyFiIvxWvB3U3vYy7VB1yqE5ufls4bXTCAnhBzDMNtOl%2Fd4e04dXpbCF0yLSKVGw99jSwjDcb%2FCwLLNjUNoccxq90lAQkrqcRlZsDjQleNXxL8YiNGdzwVCa7ug4yKZNcK%2Buu46gx%2FMr6cBPFWSeBIx9m2PEOK1BUg%3D%3D',
    type: 'jpg',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/84210148-ec76-4680-818a-e4988b8b1fa6-received_819288612901164.mp4?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=mMdR5jPIFNYiQd9nYlCS4FprqnFjAmUE3B4PmWSRpyz2MMLl9DamWCw8VmGHhOAebRSBf7nUmawV%2BZVW590FNRNR973oi7tHOrb46MBdFN3jVmxeRZ5S7C6f6qf8sgmqShw51OjB8Yna8i5kbAx7s8n3Lj%2BFzTnBJIljZv6Wjkxprm96l6wJcw7%2FQjyMn%2FpLAvuKfDg4I9xp579W%2Bk2b0zxJgao9IZZce6cBOIFJZYbuxi%2FL4diPHttH9r%2BPc59XpyKkj9LfgGpEwytNMSwqoDDimCF6%2FY2tZPhq%2Bz8DHJiMseCMPyemUHs3qhRj9RXZAhkwsidL9qKKIIk5vxeBGQ%3D%3D',
    type: 'mp4',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/168a777b-33f7-415b-96a1-b97d5ebe9307-man2.png?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=YGa6OSSMYT2Mrcn%2Bjv%2FnE7rW72w%2FznTSvbeDko7c5ZXvbLB11E%2FEp7LCxX8gkWs60kj2SDVRK7UDBL33Dn7cQxEAXKQLQkxhHMOE36r03stPBv5pP3tKMFyt8%2Bv8woXHorIWuRlR1kmj8vze9zRRyfWlsRs1DzkTtrAWdoR7pU8tlOAiXjdgWd7%2FL8zvUrM9WrjIn96Z0hXq%2BQbBcsYwrTJaZDl8YmMg7VbEAL4QR9KIsZEeErYhZe6wGo6D3rC5I6t79lJ1XRc98okMycBeCXS1gAUGDYjytCAfeC%2FEAq8t0kFnE%2F%2BGJuZZQ%2B%2FN%2FcoFctIdGWoPE0pCFmcCBIrR8g%3D%3D',
    type: 'jpg',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/424e4f9a-8c1f-4348-8514-334e69825930-7u9vj6.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=drE97cw7F98jTTeXlY0gDwEmhlSfUfhsksXlxfCZRHH60jsvdJ1kUIZf8ZoPDLYWg%2FRl4dZEL%2FMX6q6NHKXGrD2pgHoNxk3IRH5%2FOUlYnyFQHpETLh%2F4ns0ys4Sh0TeU7rOv%2FXRBnJ%2F2QycMX%2FeYYtlhRKoATfrs0rZ9DPoogcRon4aTtefsUoexWPK1KpYgL%2BlbS9AC3Mv3XH1my5tzf564n0bixpxoWn1WytduFvNfIZiK76IYS1hkZRkE%2BpXvpho123cUV%2Fw%2FVmrSRIqpCPFOBvrVDoy2p4NBspzm6NUw%2BLg9eij89UpvjnYhJWAqHy9qV3I%2FbpMAg1IPQauusQ%3D%3D',
    type: 'jpg',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/cccb2457-267f-47ae-bded-591279ae93b6-images.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=PMVkq809lL3YDcejeDjYB7GUWoRUj%2FYx4i253n9i%2Fw1zRJb%2BwPhi08BX08H4ZQtYeZTB59aoDJZdFoN3NLGYPe1iph9VO1CY9s8jwoYW2IQR7r1himeS7tWzF7l9Tp%2BNX2%2BaiXZcHNRrF%2FN%2F3TCS%2Bh5dZJoOPVg4EgW5b0G%2FF10kKjsqcib7VMlRqW6wl%2F5Ajxo1zgDg6djDa9g643r7qYF3o0Q7g85%2BBlkByGY%2B9flv3u1gV%2BkuLpdF9z55IesZmJkTfC2MiqlyfmN9WgFRjc%2BGLJGcY%2BtqLpf2eFmTe29g1mBiA9LL%2FrzccYiPDXW%2FJQw%2B6YqqAkFLrgsDvGrTUw%3D%3D',
    type: 'jpg',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/656a6be7-48d7-44b6-87b4-ff4aba1d652d-oratrice-oratrice-mecanique-d%27analyse-cardinale.gif?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=U13F%2B50mTdrab715wrfiQaZKjsLTv7GdJu6uFYYy4ydqdt9Dltovo3Y3JY0OxZ87M1W8sGOhAskXgKmWCGR%2B8faUn36V5tI6a9C8m78qV0EXcjuMcu%2B1uBOipy0lXzxjaIJ5zLbuCKMiVZ5QlcIZOXcFwSWgrd77sEPVPEFAPoiuY54RRWyEea7VFBndZ%2BMdJ0Bk9aVkge%2FZH7QJzQS%2BO9wVzHA%2Bmft33%2Fk9A%2BohygS28n6df%2BzBYEKCz%2FdBqNMYhWBSABh1kgp%2FvbBKTP%2BCcqR0sDC13yPnuvaMDFGTUtJDLy6ZvIHtl6n%2Buk4Kwcz2gwe8dDXkZ0d2ZR%2BlU6nSMg%3D%3D',
    type: 'jpg',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/ac7f982e-358a-44f9-baf6-4e2fb95c0cac-Image20231111224943.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=P4nwnkpIPUnamZDv%2F8PXTlNMJ1%2Fvsv3ScbLdN59FLQxCLCVC5P5ViWo3weAwkLI9WYIXU101BLDAF5WU8d1Bnu6g6CwnaLAAb%2BKU%2Fbz1MhwSwHNJMc10yEcqVcrP%2F0huukaEpAhagRy4wNVwLi4%2B%2FVlA3KE0NO756isCTVrBlXOGvc91hOOLzUEs%2FT112oxmiC2HLeHn9cXkCmnaZCEDmXGr%2FoOGh10bdVB1oGupI%2BmEUhcIXassez7fqBeovVjf%2Fq6g7qiduCgteuxyOv%2FD%2B1cUZ83IEVDsG6T1DImUyvTZM3klNhXntfdsETajt3gLIXClchlf%2B%2Fa%2FJSYF7d6PWw%3D%3D',
    type: 'jpg',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/f63c19c0-ce91-46de-a5be-318217d62229-a5aad3096c6bac44.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=TV8AVGfH%2FNuKc08DQ7smsZWtwmqs1XIIp%2F3QXz97UnH9lHEwOgjpHgnS%2B9jEHQCQ2vGQEqDiJ3%2Btn6VuucKqd8B4sP08qOiBBWOsEF%2B5BvK6iL0birTTDRZB4ZtCiIw%2BJRG3drKTwSr0P5%2FCesno6SszIpci5Fkzehkyr1NuCgbdvzBK2lBi0rvEt945wssFVdfcO78eWCFfBmuUDWcLahyJ09L8lZbfHnZKY0u7Hc617%2FYcy1l%2Fc1GjZDVVJ8aCfeHNlXbll889P%2BOhY3Qqrvng%2Fu54mn9cMgcn1nmUpVo%2FbiZTEbeIavZcUj08kttgQ%2Ftud66h2znHwhbKNIO6Fg%3D%3D',
    type: 'jpg',
    _id: {
      $oid: generateObjectId(),
    },
  },
  {
    data: 'https://storage.googleapis.com/gigachat-img.appspot.com/f63c19c0-ce91-46de-a5be-318217d62229-a5aad3096c6bac44.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=TV8AVGfH%2FNuKc08DQ7smsZWtwmqs1XIIp%2F3QXz97UnH9lHEwOgjpHgnS%2B9jEHQCQ2vGQEqDiJ3%2Btn6VuucKqd8B4sP08qOiBBWOsEF%2B5BvK6iL0birTTDRZB4ZtCiIw%2BJRG3drKTwSr0P5%2FCesno6SszIpci5Fkzehkyr1NuCgbdvzBK2lBi0rvEt945wssFVdfcO78eWCFfBmuUDWcLahyJ09L8lZbfHnZKY0u7Hc617%2FYcy1l%2Fc1GjZDVVJ8aCfeHNlXbll889P%2BOhY3Qqrvng%2Fu54mn9cMgcn1nmUpVo%2FbiZTEbeIavZcUj08kttgQ%2Ftud66h2znHwhbKNIO6Fg%3D%3D',
    type: 'jpg',
    _id: {
      $oid: generateObjectId(),
    },
  },
];

const mediaProfile = [
  'https://storage.googleapis.com/gigachat-img.appspot.com/d8579634-970e-464a-b99a-607836b04ed3-img_1_1702580714891.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=QqllioOXxmf%2F40CfdWxhVgJDH%2FzJ3g8MxezRzpyRKflEXyEmIhTEC%2FygEP2kRm%2F0GeJ1IvyzLvpxxlJO%2BLoxdf4v1KCkOhBYZxGt3Hv48J%2BN392%2F0X3WPrSG4ntgaT47ntoKzH%2F%2B8AM9BTPiUN5z5wM%2BqaGmr52IdlJgQTTgHMJT%2BUwOZLHJ64YXs2joHVSW9oaQ5yHrJoXwL%2Bw71PhR7%2FLl0tQAnfwipVJ3cZCnN4qpLqg0XOjGYwaOxKpC88M6GXOpV7rowuGvdyGOwdvbu%2B8VovT80cw0UPsT1yNok%2FWPo0zXH9cfieVlo%2BOVeuQntpOO%2BpzNr2rUN0yUiExcnw%3D%3D',
  'https://storage.googleapis.com/gigachat-img.appspot.com/6215a19d-4e3e-4261-a6c2-f6899370cadd-FB_IMG_1586365831680.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=gsHjwq0z5v1lRDfbe0kV4AvFifa8RHGHcLMcuxXLCcgTruEqEMJBNiEuNJZRsylUppS2yntqWddBHuPaT2khGoiApR2gDvxUtGocrJNuAF%2FS9Cqg1%2BJQNKmCWk8yq5wyL9r9VYbj33%2Fi7RWP0oVtfqXp7881joLGyrh9TbsfI%2B22QYeDn8yVg%2BbwjwVYxr8qXjvEHEwUWY%2BbfSpM6V0vkvKJ2QQfK4JfKdqzcq%2FopLlp0fjY9M5YuzalOfilRKjAVMQVuOC3zeJdqBUHr7U4SwoD%2FgoSVAdfDpXszDUphwXvdiy748o7WUfVQiouWaMYTLdZsbruKIChBDzpKlOAvg%3D%3D',
  'https://storage.googleapis.com/gigachat-img.appspot.com/5d1cad24-bf69-4d12-bc32-f9e118bb2d39-FB_IMG_1586365805459.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=UL3kqux9iLLqkQW7BdqI3yeQG3YHJFFl6DfyJN3PVBs5fIxnC%2FmoBFbnnaMde3BXlXxH9v7cP9%2BwUdiIovDT3BvgOqERAt5KLH23IE0RAyBalRd5JGfcS3zVDRYNqqm%2FhbaZ2C%2Bp7lh4fAUS4ZwPkPTxCAihFprh5NSoWjNGWfbz%2B%2B83lmfOlPhNfD1shjBPpQOapnn5ZHUyWTGMOqIYbYygWC6NxJ0rob5Fx6PZP%2BU3insr4hbJAb%2FfMzbpk79qy%2F4H0VUKzt32aK%2Fuic4y2PB9VRhH8mopefDfZSi8cQbRJIMa3b0DMMBaKduNIpf1iv3XGgYmu%2F7P7pEpkz1Ozw%3D%3D',
  'https://storage.googleapis.com/gigachat-img.appspot.com/5556b45b-2bae-431d-8e69-3d2a0ad08733-FB_IMG_1586365776056.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=G2%2Fp2nS4X8NG1ruWY7oLVCRfTt8veKSW0gN5URvjTZTeWzS2gyrzuodvX0%2FbbanbFz2jhsp0Ny7s1Sy6WWYld81a6OV88mAeer7Y%2B02bWteRmsnI0gKDZ%2F9P76%2BAZx2mwFMPRtFbNSyyabvrihyszIrsJsBzR%2Frhk4e2vSb99sH2NrB6NDFiYw02M0sMR9e7Gyp7DaMncIObdaVVCydKT%2F4PR%2FCh6KoPGjCGk%2BHgk1%2Bob%2FSQKI8TUPE5m61ZwhFXiQJw0oXVLYymlJ50s%2FTZdlBEANyMDKrB6uUZ6xWJ8x9f%2FQTXZMR8Gj6G2cWbh6IvsIyeltYdoe9%2FW4tCauX1FQ%3D%3D',
  'https://storage.googleapis.com/gigachat-img.appspot.com/3be039ad-bc15-4a53-929a-398368e3e32f-FB_IMG_1586365788787.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=Xz8ktQQbRhgzUf%2Bqw%2Fz0cN4dJKUlKW9lkEKKTHWoWC20IvdoJAMtYxWjwnrwXs61ImrLgZDpo%2Bfq1l6tYrketi4RrkGWypSWICNrsO90bKAbCSKKdMPJEc7eEH5DQwXHN1BdGApOhx7DmYYymHOhbI%2FkeVzFYpmDUUFBz67NICuKwAxua42y7%2B%2F6cnMeQWjUcY2rIWdgOyzaEa7PWlQzlON9p4k83OGlVxZmiLDDOUqvya2M7aeGzgBWPM8WBk%2Frt0ovTLIj0b4g4WakJGj7XTYulrwQ7CcQkImRPdKxNevNQkXmd90w8N6K%2BIXt1P53qSsZliU84pwZZuulUhvK6g%3D%3D',
  'https://storage.googleapis.com/gigachat-img.appspot.com/e9d0883c-27c9-4ee7-a2fd-08c0287d129d-IMG_20231119_174502.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=naKfDuV5mkPbNjY46UWfG9lPSBQJ9Um9XC2MM%2Fa%2FF2yULBIoAqbLAEyhdyv7ZxufLMwfixD70t5guoVjUgeHhp6zWe8WIaFIediP85AuCUMR6YH4y%2B4JA4DePSEmR1VmaTY0b6yBc4susfR41YhjZVnWNu8pLPOG2cxD3x5ojlhBcNey9Koj4hz3OR%2BvXhe8zSUXa9QeiHEY%2BpQVq%2F6fQoBERLIXt1a9FMrt7VSRPnPlsolfLmUj6NPsFP2XwDT9qfEytikV6v9yK4jnQ3ZSfu1MK9kY3zEwy80kifRq5oHHmejknBrgizCIxOV6yLyRJBtvneRqRcxUNhTWFVCsAQ%3D%3D',
  'https://storage.googleapis.com/gigachat-img.appspot.com/072f04c2-e189-4cc8-9ea6-b606768d6f9a-FB_IMG_15812083511624187.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=e3Qe3IKjelx0vLnFctYwwfzfTnbMRuXCvL12u0Er7cYdXxfET5XCX6grpOy8%2FaQb4kf3a3ShnjqxCgXvB9Dp9JJXGS098fyGF%2F8DXwLnDsu8HBHCqUeoqwjhIX77%2FtYllGA8TDKJiqFTGzyy9vJesiGjqg0FFZ7E0%2B6x%2BTjwOH5e8nG7y8lrmhg6B0SXK5HUh45QzFVKNqdJ7mr1EEt5AFw3o3KEJSPnMUMRy5H9fZRdSAsqCQZw9kQXVWG%2BY0%2B6etQFIgWJQvRelME3MVTwChP19q%2F9dhFwGL4L9Da%2BmcJHRlaUtPJE0AnRfyAFM76r1uUuPpHav0ZFuyiUx5dAdg%3D%3D',
  'https://storage.googleapis.com/gigachat-img.appspot.com/3ed5b2fb-34c0-49c9-aaba-56d043e7232f-img_1_1696641593752.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=fEv4IFvEMS5Tw3HmcmqYq%2FDZL3UomV9uA0q2IWmYdeOwOxRDC5icvZdR3shLAO65jUtFHlggu2Gl9emDY6g7nHE4imBlFn8uktZvpGXGCiIMGDEDYyDWB7VOFcEJgB7pT%2B2%2BZddhyfgcqK5yJysFQw%2BsOURgVXLCf2PQABBRp5ydn8PHtHFy%2BB5XilJDHTi%2BFlR4VI%2BO1lXZ4RP%2F5B6jx7YjALh4UdehVYKUCDrBVvpBaOquap07d6uPFsHUWnF11PvKOQYzr2N7vs2%2BOmKahoiiCjkHe8GoNOSuMcJsflAd%2Fm5L0bavmlEk6Ah9RcEdlU%2ByF7f6%2B0dGF%2F4OEe%2BeyQ%3D%3D',
  'https://storage.googleapis.com/gigachat-img.appspot.com/8a43fcc5-3066-41f8-af2f-c1496694da53-img_1_1684169795919.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=SEEBxdbtnM7P7ah7LRZjPL273hfBivdoEUIpk%2BnP4Tfoobgzm26CuaTSwQH7JiGW7mMjD0ngPdasUPyP%2BgBSKUELGbEE%2BQgtTfa9MWWNMeLyOXjKKhWf04ju3qpaQ%2FYYVazkTShssanHsM%2BDeXEPeH8m2ZKmhsaWcov6pLW9ofBk%2FxM1EJOd%2F75EwXc%2BhlHsuQL%2BhmKNCab8CZ0hocZrUmuSB9XTZLVJpkGlMvCkoFBbxZjP1yKValFtcvipKwJ7PlEfd76rLHSerxIZAy4z33tEfwwbZkbB%2BmRY%2BwCyVbQ3Tbk%2FdBF5DXOOb6PAmVxyzc5AoQN%2BNYtHKLSAsE7teg%3D%3D',
  'https://storage.googleapis.com/gigachat-img.appspot.com/8e29bad5-a67d-4119-8bd3-47d8b37f4876-FB_IMG_1473181300534.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=QhsYabkClVskAEEBhif0V8FKNPjf%2F%2BgcJWk6tuCV20W3gtSsecKpkG7%2FkLzE9kKyTLJF4n2DWewJS9%2BNdAWaWxmvKc73TnUDwssO3K0MT4jIIkW9BuaXPrHDuoP2F8%2FvR0cMObBF3fNqHM%2FlWyPuf5pti4vAviMYAYdftZQFQ%2FtjetTywGdYCtSA4HgQf6j%2BkwStJhEOXszcMX6M4YndG874URnWStYD%2B6cMdE3nEIsHjkM44yu9N2XvirjAZlUALhg6IvjXA6nKej%2Flq5m8h1lEo6wWdoJ0EYG82P1Rt8F%2BWcyQUlZXXGotH9gflivLnWUKA%2Bs0IXyL3Slft%2BeTdQ%3D%3D',
];

const mediaBanner = [
  'https://storage.googleapis.com/gigachat-img.appspot.com/a63d3c7b-deca-4089-8dfd-ad898315c128-image_cropper_1703578033016.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=WbK2OvKCvMRuhygpYe5UASbm%2FMTdhU341jVUL8n7PS9o5qgOCuq3Hs4NKtXGCyzNuuyBbKGK4EerkZfJhpcIoStcximdxryDF%2FbvlIk%2FuJjAqqHYPoQgCGW64HnimO5DC5KSdPON03vVrkxAEHaRwPC%2Ba9MyYAqnNDQaGYuD%2Fc863z%2FeCM4YANjquKptoAKRK0tnKExeM3vy2ZBeS0IyY6okK2UXcsaZ%2F4w1wR%2FykXGRXbCgIcf8GjA7%2FGACo3yCrpYCi6kzMetVFA%2FBuYCX%2FoC4REbzOMJj5BhN8vZ1HFedIQJEZ4eaNcS3nEtY4hnTiMiqjjnNGFgHs0%2Fu9YJiKQ%3D%3D',
  'https://storage.googleapis.com/gigachat-img.appspot.com/fb022f14-32bb-4961-a51f-d06796e4496e-image_cropper_1703592332685.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=KipTYGhobxj7rbXDnG0kB0wsBTRUqbF3KEpdQLOulSnyC7sCL%2FgTTrUW%2Fmxm42MQO9bm5XGohdmq0TgiElVME8ajfNxm5McFmNLUudO821OQFLzray1XXDb9JW4XEB%2B9V%2BzztWKKYlnhfxtivq0PgEuLj94E%2BAYpB9p%2B3auFh5%2F5ngR%2FebiwYz7m%2F9Rl3PIbbZ%2BJ9DvSqdpKq8t7FVD5wvnkpomRLd83YOqaUBqIr%2BYjQCz5R0jQAYtms32chwVtAWe1URKKkKtAfR%2FbJkC6BuyzFgNsXnKCUbBSmr3rIpM8INtE1zbKGOq1%2FxbDtGQ6f2yNudvh9mu%2F%2FC5l6rWIVw%3D%3D',
  'https://storage.googleapis.com/gigachat-img.appspot.com/933539c1-ed0f-48a1-9b27-27ae7d47d3b5-image_cropper_1703592299468.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=WlsH5Eo66ZHdkHZufiEKxIr2AXrIELwBA2E3AmGm1T%2FH%2F%2FPiGWNbl71p%2FXf0YR9EWu2E1EvjhTQstzwpyqB966yO48kY0nsnOucMmGHz6oNMS9LPbO8ty4rTGe4X7TAG6bE%2BD%2BefX3WX8ixZ8qFPNWVHIfdKV%2BuS33M%2BCcBl%2BcspLC7%2B3NlloH3AHeAN0kg0fbIcwOz%2FxyQMo2iygIRXVoFgqm0aClz3CuR3mlNKVCM857eD9%2BeIr558jR%2FzM%2BZgPw4oz3yWupUGKJ75jQVXU1r32Upmco3XKtQZyiBRQHG8q3VXylLkyMdILvFeUs9U6KIz3hLaIE7r5uJjdl5kiA%3D%3D',
  'https://storage.googleapis.com/gigachat-img.appspot.com/e643bfce-2557-4692-abb2-d76881a28b31-image_cropper_1703592238418.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=MYjiwxRkhK9gMdtoE%2BaMzbWPO4XRw6pwA7JVRALmLffX603XW0kXan7ZL03wmmsHd45jjr0fJ9xjq%2FKe48Cvydnvp2YvaDmkLgyi00ruA8dHx6IU%2FsgSoa6s9hm1mCOcW%2BUTCPg4x1KJqHvE%2B%2F9Ww4DOu36NZJWrCplkNXFq3%2BC%2BpJIRHh97RqzxiY7nEuBXDopT4bkl2fEGIVFsbDIVueMr2pSivDyfUb5upN1tDL9M0KEpj7TkeSESXk5p90UOFL6rxX95NHA%2BpJ5Jvg6YgyRHHlgb81eSjI3ApJG04hRocEUpM841AnJv41ODGrliyVvIe6tYJ%2F33%2BmDpsCJZ0Q%3D%3D',
  'https://storage.googleapis.com/gigachat-img.appspot.com/aec85411-7c84-456a-a208-0db2a33c8574-image_cropper_1703591878992.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=QLacIm3B8VNvE7Bsev0yHFONKYZZmrtVU7XD0qUoRtW3TFheMxGmUe%2FSmXm%2Fe3DZidk8y1Kz3%2BKYJgNg%2BiAbixof28ccYpiIUWrruA5ZsJvyHp3m8e3yZbt3nv3ci5hY8u%2BN9bnn38L28X9CWwYe98gGDEPCRVAK0aFa0tFfo4blOhlzQ08801WT5C5y2MR2dg3MR9TUE4zCWc6DyBRDDNWAFm0BESOh9pTzXS9FDMG401Sxxk1yp5GkXZAaACXDJs1wxkh9noP3dv7g3TNilqcW7dI1or6Fqy6S1WSO0h6ttrAlT%2FnmPxPjV1Tx%2FSnDMSqiW6M1kn35CUXy7Am9bg%3D%3D',
  'https://storage.googleapis.com/gigachat-img.appspot.com/3bf1203f-5885-4eb8-b0f9-6ea2c497314c-image_cropper_1703591817350.jpg?GoogleAccessId=firebase-adminsdk-5avio%40gigachat-img.iam.gserviceaccount.com&Expires=253399795200&Signature=ln6cPYFsWIvIfty6%2BlZJZ%2F7uBAXWe1KDanz0hK64No2F9kXJ3gtXr8kWCEANb6i0RIA%2B75KPz9wnAc3KoLewJWiehJl%2BNyCrd%2FDSyXpXOmw7vuEIpJiYfu%2BMFTIJPPCoevr86YmiSvupa0E86z4CBL781bXqnxcbU63eqCUYGFmfFgKjfGgv%2Fs%2B8cLLCpBvlS7Df6FW7rTMt3GA1ciuybykX9czmnFZ5zkLOwFc8JZ4RivtQk2%2BRtQCmsvyLJPjqnf8%2BDIgrhh8y538IfHMUuQuz6CDWC4Qu5Vbcnz7JXTgDK4MsaDOybpGwindVYoEi3zpVhx%2FRgmIH5ZNAklmG1w%3D%3D',
];

function generateObjectId() {
  // Convert timestamp to hexadecimal
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);

  // Generate a 5-byte random hexadecimal value
  const randomValue = Array.from({ length: 5 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0'),
  ).join('');

  // Generate a 3-byte incrementing counter as a hexadecimal value
  const counter = (Math.floor(Math.random() * 16777215) + 1)
    .toString(16)
    .padStart(6, '0');

  return timestamp + randomValue + counter;
}
function getRandomMediaProfile(users) {
  for (let i = 0; i < 1000; i++) {
    const random_media = Math.floor(Math.random() * mediaProfile.length);
    users[i].profileImage = mediaProfile[random_media];
  }
}

function getRandomMediaBanner(users) {
  for (let i = 0; i < 1000; i++) {
    const random_media = Math.floor(Math.random() * mediaBanner.length);
    users[i].bannerImage = mediaBanner[random_media];
  }
}

function getRandomMedia(tweets) {
  for (let i = 0; i < 1000; i++) {
    const random_media = Math.floor(Math.random() * mediaTweet.length);
    const random_tweet = Math.floor(Math.random() * tweets.length);
    if (tweets[random_tweet].media.length < 4) {
      tweets[random_tweet].media.push(mediaTweet[random_media]);
    }
  }
}

function generateUsers() {
  const users = [];
  for (let i = 0; i < 1000; i++) {
    users.push({
      _id: {
        $oid: generateObjectId(),
      },
      username: faker.internet.userName(),
      email: faker.internet.email(),
      birthDate: {
        $date: faker.date.past(),
      },
      profileImage: null,
      bannerImage: null,
      phone: 0,
      nickname: faker.internet.userName(),
      mutedUsers: [],
      blockingUsers: [],
      followingUsers: [],
      followersUsers: [],
      likedTweets: [],
      notificationList: [],
      chatList: [],
      mentionList: [],
      joinedAt: {
        $date: faker.date.recent(),
      },
      isDeleted: false,
      active: true,
      tweetList: [],
      bio: faker.lorem.sentence(),
      location: faker.lorem.sentence(),
      website: faker.lorem.sentence(),
    });
  }
  return users;
}

function generateReplies(tweets, users) {
  for (let i = 0; i < 1000; i++) {
    const random_number = Math.floor(Math.random() * tweets.length);
    const random_number2 = Math.floor(Math.random() * users.length);

    const author = users[random_number2];
    const current_date = faker.date.recent();
    tweets[random_number].repliesCount++;
    const tweet = {
      _id: {
        $oid: generateObjectId(),
      },
      userId: author._id,
      description: faker.lorem.sentence(),
      media: [],
      views: faker.datatype.number(),
      repliesCount: 0,
      likersList: [],
      retweetList: [],
      quoteRetweetList: [],
      type: 'reply',
      referredReplyId: tweets[random_number]._id,
      referredTweetId: tweets[random_number]._id,
      createdAt: {
        $date: current_date,
      },
      isDeleted: false,
    };
    tweets.push(tweet);
    users[random_number2].tweetList.push({
      tweetId: tweet._id,
      type: tweet.type,
      _id: {
        $oid: generateObjectId(),
      },
      createdAt: {
        $date: current_date,
      },
    });
  }
  return tweets;
}

function generatetweets(users) {
  const tweets = [];
  for (let i = 0; i < 1000; i++) {
    const random_number = Math.floor(Math.random() * users.length);
    const author = users[random_number];
    const current_date = faker.date.recent();
    const tweet = {
      _id: {
        $oid: generateObjectId(),
      },
      userId: author._id,
      description: faker.lorem.sentence(),
      media: [],
      views: faker.datatype.number(),
      repliesCount: 0,
      likersList: [],
      retweetList: [],
      quoteRetweetList: [],
      type: 'tweet',
      createdAt: {
        $date: current_date,
      },
      isDeleted: false,
    };
    tweets.push(tweet);
    users[random_number].tweetList.push({
      tweetId: tweet._id,
      type: tweet.type,
      _id: {
        $oid: generateObjectId(),
      },
      createdAt: {
        $date: current_date,
      },
    });
  }
  return tweets;
}
function generateHashtag() {
  const hashtags = [];
  for (let i = 0; i < 6; i++) {
    hashtags.push({
      _id: generateObjectId(),
      title: faker.lorem.words(),
      count: faker.datatype.number(),
      tweet_list: [],
    });
  }
  return hashtags;
}
function likeTweets(users, tweets) {
  for (let i = 0; i < 600; i++) {
    const random_user = Math.floor(Math.random() * users.length);
    const random_tweet = Math.floor(Math.random() * tweets.length);
    if (
      !tweets[random_tweet].likersList.includes(users[random_user]._id) &&
      !users[random_user].likedTweets.includes(tweets[random_tweet]._id)
    ) {
      tweets[random_tweet].likersList.push(users[random_user]._id);
      users[random_user].likedTweets.push(tweets[random_tweet]._id);
    }
  }
}
function retweetTweets(users, tweets) {
  for (let i = 0; i < 1000; i++) {
    const random_user = Math.floor(Math.random() * users.length);
    const random_tweet = Math.floor(Math.random() * tweets.length);
    if (!tweets[random_tweet].retweetList.includes(users[random_user]._id)) {
      tweets[random_tweet].retweetList.push(users[random_user]._id);
      // users[random_tweet].likedTweets.push(tweets[random_tweet]._id);
      users[random_user].tweetList.push({
        tweetId: tweets[random_tweet]._id,
        type: 'retweet',
        _id: {
          $oid: generateObjectId(),
        },
        createdAt: {
          $date: faker.date.recent(),
        },
      });
    }
  }
}

function followEachOthers(users) {
  for (let i = 0; i < 10000; i++) {
    const random_user1 = Math.floor(Math.random() * users.length);
    const random_user2 = Math.floor(Math.random() * users.length);
    const follower = users[random_user1];
    const followee = users[random_user2];

    if (
      !follower.followingUsers.includes(followee._id) &&
      !follower.blockingUsers.includes(followee._id) &&
      !followee.blockingUsers.includes(follower._id)
    ) {
      follower.followingUsers.push(followee._id);
      followee.followersUsers.push(follower._id);
    }
  }
}

function blockEachOthers(users) {
  for (let i = 0; i < 500; i++) {
    const random_user1 = Math.floor(Math.random() * users.length);
    const random_user2 = Math.floor(Math.random() * users.length);
    const blocker = users[random_user1];
    const blocked = users[random_user2];
    if (
      !blocker.blockingUsers.includes(blocked._id) &&
      !blocker.followingUsers.includes(blocked._id)
    ) {
      blocker.blockingUsers.push(blocked._id);
    }
  }
}

function muteEachOthers(users) {
  for (let i = 0; i < 500; i++) {
    const random_user1 = Math.floor(Math.random() * users.length);
    const random_user2 = Math.floor(Math.random() * users.length);
    const muter = users[random_user1];
    const muted = users[random_user2];
    if (!muter.mutedUsers.includes(muted._id)) {
      muter.mutedUsers.push(muted._id);
    }
  }
}

const users = generateUsers();
getRandomMediaProfile(users);
getRandomMediaBanner(users);

const tweets = generatetweets(users);
generateReplies(tweets, users);
generateReplies(tweets, users);

getRandomMedia(tweets);
const hashtags = generateHashtag();
likeTweets(users, tweets);
retweetTweets(users, tweets);
followEachOthers(users);
blockEachOthers(users);
muteEachOthers(users);

fs.writeFileSync('.\\users.json', JSON.stringify(users, null, 2));
fs.writeFileSync('.\\tweets.json', JSON.stringify(tweets, null, 2));
fs.writeFileSync('.\\hashtags.json', JSON.stringify(hashtags, null, 2));

console.log('Data generated! 10000 new users and tweets created.');
