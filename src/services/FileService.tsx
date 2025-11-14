import BaseService from "./BaseService";

export class FileService extends BaseService {
  constructor() {
    super("minio");
  }

  /**
   * Upload file (avatar, document, etc.)
   * @param fileType - type of file (enum value, e.g. "avatar")
   * @param userId - user id
   * @param file - File object from input
   * @returns { key: string; url: string } key trong bucket + temporary URL
   */
  async uploadFile(fileType: string, userId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await this.api.post(
      `${this.endpoint}/upload/${fileType}/${userId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data; // { key: string, url: string }
  }

  /**
   * Get presigned URL for a file
   * @param fileType - type of file
   * @param userId - user id
   * @param fileName - file name in bucket
   * @param expiresIn - optional expiration in seconds
   * @returns temporary URL to access file
   */
  async getPresignedUrl(
    fileType: string,
    userId: string,
    fileName: string,
    expiresIn?: number
  ) {
    const params = expiresIn ? `?expiresIn=${expiresIn}` : "";
    const response = await this.api.get(
      `${this.endpoint}/url/${fileType}/${userId}/${fileName}${params}`
    );
    return response.data.url;
  }

  /**
   * Lấy presigned URL từ key
   * @param key Đường dẫn đầy đủ của file trong MinIO
   * @param expiresIn (tùy chọn) Thời gian hết hạn tính bằng giây
   * @returns {Promise<any>} Presigned URL
   */
  async getPresignedUrlByKey(key: string, expiresIn = 3600): Promise<any> {
    return await this.api.get(`${this.endpoint}/url/key`, {
      params: { key, expiresIn },
    });
  }


  /**
   * Delete a file by key (full path in bucket)
   * @param key - file key
   */
  async deleteFileByKey(key: string) {
    const response = await this.api.delete(`${this.endpoint}/delete`, {
      data: { key },
    });
    return response.data;
  }

  /**
   * Delete file by type/userId/fileName
   */
  async deleteFile(fileType: string, userId: string, fileName: string) {
    const response = await this.api.delete(
      `${this.endpoint}/delete/${fileType}/${userId}/${fileName}`
    );
    return response.data;
  }

  async getSignedFile(body: any): Promise<any> {
    try {
      const response = await this.api.get(`${this.endpoint}/key`, body)
      return response;
    } catch (error) {
      console.error("Error fetching decisions:", error);
      throw error;
    }

  }
}

export default new FileService();
