module.exports = {
  register: {
    body: {
      validation: {
        $async: true,
        type: 'object',
        properties: {
          prefixName: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          abbr: { type: 'string', minLength: 2, maxLength: 2 },
          email: { 
            type: 'string',
            format: 'email',
            isNotExist: { prop: 'email', collection: 'users' } 
          }
        },
        required: ['email', 'password'],
      },
      message: {
        email: {
          required: 'กรุณากรอกอีเมล',
          format: 'อีเมลไม่ถูกต้อง',
          isNotExist: 'อีเมลนี้มีอยู่ในระบบแล้ว'
        },
        password: {
          required: 'กรุณากรอกรหัสผ่าน'
        }
      }
    }
  }
}