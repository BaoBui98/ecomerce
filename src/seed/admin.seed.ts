import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserRepository } from '../user/user.repository';
import { PasswordService } from '../services/password.service';
import { UserRole } from '../user/entities/user.entity';

async function bootstrap() {
  console.log('--- Bắt đầu chạy Seed Admin ---');
  
  // Khởi tạo context ứng dụng NestJS (không khởi động server HTTP)
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userRepository = app.get(UserRepository);
  const passwordService = app.get(PasswordService);

  const adminEmail = 'admin@example.com';
  const adminPassword = 'adminpassword123';
  const adminName = 'System Admin';

  const existingAdmin = await userRepository.findByEmail(adminEmail);
  if (existingAdmin) {
    console.log(`[Seed Warning] Tài khoản admin với email ${adminEmail} đã tồn tại trên hệ thống.`);
  } else {
    const hashedPassword = await passwordService.hash(adminPassword);
    
    await userRepository.createUser({
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: UserRole.ADMIN,
    });
    
    console.log('===================================================');
    console.log('[Seed Success] Đã khởi tạo thành công tài khoản Admin!');
    console.log(`- Email: ${adminEmail}`);
    console.log(`- Password: ${adminPassword}`);
    console.log(`- Role: ${UserRole.ADMIN}`);
    console.log('===================================================');
  }

  await app.close();
  console.log('--- Kết thúc chạy Seed Admin ---');
}

bootstrap().catch((err) => {
  console.error('[Seed Error] Khởi tạo admin thất bại:', err);
  process.exit(1);
});
