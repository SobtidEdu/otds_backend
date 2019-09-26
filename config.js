exports.PAGINATION = {
  DEFAULT_PAGE_NO: 1,
  DEFAULT_PAGE_LIMIT: 10,
  DEFAULT_SORT_KEY: 'createdAt',
}

exports.GENDER = {
  MALE: 'ชาย', 
  FEMALE: 'หญิง'
}

exports.ROLE = {
  STUDENT: 'student', 
  TEACHER: 'teacher', 
  SUPER_TEACHER: 'superTeacher', 
  ADMIN: 'admin'
}

exports.SCHOOL_TYPE = {
  SYSTEM: 'system',
  OTHER: 'other'
}

const STORAGE_PATH = 'storage'
exports.STORAGE_PATH = STORAGE_PATH
exports.PROFILE_IMAGE_PATH = `${STORAGE_PATH}/images/profile`
exports.GROUP_LOGO_PATH = `${STORAGE_PATH}/images/group`

exports.USERGROUP_STATUS = {
  OWNER: 'owner',
  REQUEST: 'request',
  JOIN: 'join'
}