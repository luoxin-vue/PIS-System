import fs from "fs";
const fn = (int: number, nameArray: string[], birthdayArray: string[]) => {
  if (!Number.isInteger(int) || int < 1 || int > 12) {
    throw new Error("月份必须在1-12之间");
  }
  if (nameArray.length !== birthdayArray.length) {
    throw new Error("名字和生日数量不一致");
  }
  const userInfo = nameArray.map((name, index) => {
    return {
      name,
      birthday:birthdayArray[index],
    };
  });
  const filterUserInfo = userInfo.filter(item => Number(item.birthday.split("/")[1]) === int);
  return filterUserInfo.length;
};
const lines =fs.readFileSync(0,"utf-8").trimEnd().split(/\r?\n/);
const month = Number(lines[0].trim());
const names = JSON.parse(lines[1].trim());
const birthdays = JSON.parse(lines[2].trim());
console.log(fn(month, names, birthdays));



function hasPathSum(root, targetSum) {
  // 你的代码写这里
  
}

// 测试用的树节点
class TreeNode {
  constructor(val, left = null, right = null) {
      this.val = val;
      this.left = left;
      this.right = right;
  }
}

// 构建上面的树
const root = new TreeNode(5,
  new TreeNode(4,
      new TreeNode(11,
          new TreeNode(7),
          new TreeNode(2)
      )
  ),
  new TreeNode(8,
      new TreeNode(13),
      new TreeNode(4,
          null,
          new TreeNode(1)
      )
  )
);

console.log(hasPathSum(root, 22)); // 应该输出 true
console.log(hasPathSum(root, 100)); // 应该输出 false