module.exports = ({ env }) => ({
  // ...
  upload: {
    provider: 'cloudinary',
    providerOptions: {
      cloud_name: env('CLOUDINARY_NAME'),
      api_key: env('CLOUDINARY_KEY'),
      api_secret: env('CLOUDINARY_SECRET'),
    },
    actionOptions: {
      upload: { folder: "smashed-answers" }
    }
  },
  // upload: {
  //   provider: 'dropbox',
  //   providerOptions: {
  //     accessToken: env('DROPBOX_ACCESS_TOKEN'),
  //   },
  // },
  // ...
});