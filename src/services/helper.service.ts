import { Injectable } from '@nestjs/common';

@Injectable()
export class HelperService {
  /**
   * Chuyển đổi chuỗi tiếng Việt có dấu thành slug không dấu
   */
  slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD') // Tách tổ hợp ký tự dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ các ký tự dấu sau khi tách
      .replace(/[đĐ]/g, 'd') // Chuẩn hóa ký tự đ thành d
      .replace(/[^a-z0-9 -]/g, '') // Loại bỏ ký tự đặc biệt khác ngoài chữ cái, số, khoảng trắng và dấu gạch ngang
      .replace(/\s+/g, '-') // Thay thế khoảng trắng thành dấu gạch ngang
      .replace(/-+/g, '-') // Rút gọn nhiều gạch ngang liên tiếp
      .trim(); // Loại bỏ khoảng trắng thừa đầu cuối
  }
}
