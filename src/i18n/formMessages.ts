import type { ValidateMessages } from 'rc-field-form/lib/interface';

export const formMessagesZh: ValidateMessages = {
  required: '${label}不能为空',
  types: {
    email: '${label}不是合法的邮箱地址',
    number: '${label}必须是数字',
  },
  number: {
    min: '${label}不能小于${min}',
    max: '${label}不能大于${max}',
  },
};

export const formMessagesEn: ValidateMessages = {
  required: '${label} is required',
  types: {
    email: '${label} is not a valid email',
    number: '${label} is not a valid number',
  },
  number: {
    min: '${label} cannot be less than ${min}',
    max: '${label} cannot be greater than ${max}',
  },
};
