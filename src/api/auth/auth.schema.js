const { GENDER, ROLE } = require('@root/config')
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
          role: { type: 'string', enum: [ ROLE.STUDENT, ROLE.TEACHER ] },
          email: { 
            type: 'string',
            format: 'email',
            isExist: { prop: 'email', collection: 'users' } 
          }
        },
        required: ['email', 'password'],
      },
      message: {
        email: {
          required: 'กรุณากรอกอีเมล',
          format: 'อีเมลไม่ถูกต้อง',
          isExist: 'อีเมลนี้มีอยู่ในระบบแล้ว'
        },
        password: {
          required: 'กรุณากรอกรหัสผ่าน'
        },
        role: {
          enum: 'กรุณาระบุ Role ให้ถูกต้อง'
        },
        gender: {
          enum: 'กรุณาระบุเพศให้ถูกต้อง'
        }
      }
    }
  }
}