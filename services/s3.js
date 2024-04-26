const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

/* S3 BUCKET SERVICE */

// Client configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Upload file to S3
async function uploadFile(file, key, info) {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: info,
    };

    const data = await s3.send(new PutObjectCommand(params));

    return { error: false };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { error };
  }
}

// Get file from S3
async function getFile(key) {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };

    const { Body } = await s3.send(new GetObjectCommand(params));
    return { file: Body, error: false };
  } catch (error) {
    console.error('Error getting file:', error);
    return { file: null, error };
  }
}

// Delete file from S3
async function deleteFile(key) {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };

    await s3.send(new DeleteObjectCommand(params));
    return { error: false };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { error };
  }
}

function generateLink(objectKey) {
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${objectKey}`;

  /*
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: objectKey,
    });

    try {
        return await getSignedUrl(s3, command, { expiresIn: 1800 });
    } catch (error) {
      console.error("Error creating signed URL", error);
    }
    */
}

module.exports = {
  uploadFile,
  getFile,
  deleteFile,
  generateLink,
};
