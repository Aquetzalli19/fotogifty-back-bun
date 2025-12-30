import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucketName = process.env.S3_BUCKET_NAME!;
  }

  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);
    return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  /**
   * Sube un buffer directamente (útil para imágenes procesadas)
   */
  async uploadBuffer(
    buffer: Buffer,
    key: string,
    contentType: string = 'image/jpeg'
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // Metadatos adicionales para control de caché
      CacheControl: 'max-age=31536000', // 1 año
      Metadata: {
        'processed-for-print': 'true',
        'dpi': '300'
      }
    });

    await this.s3Client.send(command);
    return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  /**
   * Genera una URL firmada para descargar un archivo
   * La URL expira después del tiempo especificado
   */
  async getDownloadUrl(
    key: string,
    expiresIn: number = 3600 // 1 hora por defecto
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      // Forzar descarga en lugar de mostrar en el navegador
      ResponseContentDisposition: `attachment; filename="${this.getFilenameFromKey(key)}"`
    });

    // Generar URL firmada que expira en el tiempo especificado
    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn
    });

    return signedUrl;
  }

  /**
   * Extrae el nombre del archivo de la key de S3
   */
  private getFilenameFromKey(key: string): string {
    const parts = key.split('/');
    return parts[parts.length - 1];
  }
}
