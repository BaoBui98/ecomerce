npm run migration:generate -- src/migrations/CreateProductTable
npm run migration:run


https://dashboard.stripe.com/acct_1QT55RA5GPQcv9yX/test/workbench/webhooks/we_1TVvALA5GPQcv9yXro1qxwzZ?fromWizard=true

https://dashboard.stripe.com/acct_1QT55RA5GPQcv9yX/test/apikeys

https://dashboard.ngrok.com/get-started/your-authtoken

https://docs.stripe.com/testing?testing-method=card-numbers&utm_source=chatgpt.com




# Install Docker and Git
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git
sudo systemctl enable --now docker

# Install Docker and Git for linux
# Cập nhật hệ thống
sudo yum update -y

# Cài đặt Docker và Git
sudo yum install -y docker git

# Khởi động và cho phép Docker chạy ngầm mỗi khi server khởi động lại
sudo systemctl enable docker
sudo systemctl start docker

# Thêm user hiện tại (thường là ec2-user) vào nhóm docker để không cần gõ sudo mỗi khi dùng docker
sudo usermod -a -G docker ec2-user



git clone <url-repo-github-cua-ban> ecommerce-demo
cd ecommerce-demo

nano .env

PORT=5050

# Database Credentials
DB_USERNAME=admin
DB_PASSWORD=MatKhauDatabaseSieuKho123!
DB_DATABASE=app_db

# JWT Secrets (Hãy đổi chuỗi dài và an toàn)
JWT_ACCESS_SECRET=your_production_access_secret_key
JWT_REFRESH_SECRET=your_production_refresh_secret_key
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# Stripe 
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=https://yourdomain.com/payment/success
STRIPE_CANCEL_URL=https://yourdomain.com/payment/cancel

docker-compose -f docker-compose.prod.yml up -d --build

# Truy cập vào container của backend
docker exec -it ecommerce_backend_prod sh

# Chạy migration
npm run migration:run:prod

# Thoát khỏi container
exit


