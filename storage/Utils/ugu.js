import axios from 'axios';
import fs from 'fs/promises';
import { fileTypeFromBuffer } from 'file-type';
import FormData from 'form-data';

export const UguuUploader = async (filePath) =>
  new Promise(async (resolve, reject) => {
    let fileBuffer;
    try {
      fileBuffer = await fs.readFile(filePath);
    } catch (readError) {
      if (readError.code === 'ENOENT') {
        return reject(new Error('File not Found at path: ' + filePath));
      }
      return reject(new Error('Error reading file: ' + readError.message));
    }

    try {
      const fileType = await fileTypeFromBuffer(fileBuffer);

      if (!fileType || !fileType.mime.startsWith('image/')) {
        return reject(
          new Error(
            'File is not a supported image format or could not be detected.'
          )
        );
      }

      const formData = new FormData();
      formData.append('files[]', fileBuffer, {
        filename: `upload.${fileType.ext}`,
        contentType: fileType.mime
      });

      const response = await axios.post(
        'https://uguu.se/upload.php',
        formData,
        {
          headers: {
            ...formData.getHeaders()
          }
        }
      );

      // --- PERUBAHAN KRUSIAL DI SINI ---
      let imageUrl;
      // Coba parse sebagai JSON dulu
      if (
        typeof response.data === 'object' &&
        response.data !== null &&
        response.data.files &&
        response.data.files.length > 0
      ) {
        // Jika responsnya objek JSON dengan array 'files' (format umum uguu.se untuk banyak file)
        imageUrl = response.data.files[0].url;
      } else if (typeof response.data === 'string') {
        // Jika responsnya string (format umum uguu.se untuk satu file)
        imageUrl = response.data.trim();
      } else {
        throw new Error('Uguu.se response format not recognized.');
      }
      // --- AKHIR PERUBAHAN KRUSIAL ---

      if (!imageUrl || !imageUrl.startsWith('http')) {
        return reject(new Error('Uguu.se response invalid or no URL found.'));
      }

      resolve(imageUrl);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('Axios Error Detail:', err.response?.data || err.message);
        return reject(
          new Error(
            `Failed to upload to Uguu.se: ${err.response?.status} - ${
              err.response?.statusText || err.message
            }`
          )
        );
      }
      return reject(new Error(String(err)));
    }
  });
