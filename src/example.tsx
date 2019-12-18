import { Cascade } from './component';

export const Cascade1 = () => (
  <Cascade
    itemKeys={[
      { title: '第一级', key: '1' },
      { title: '第二级', key: '2' },
      { title: '第三级', key: '3' },
    ]}
    options={options}
    defaultValue={[]}
  />
);

const options = [
  {
    label: '第一级',
    value: '1',
    children: [
      {
        label: '第二级',
        value: '11',
        children: [
          {
            label: '第三级',
            value: '111',
          },
          {
            label: '第三级',
            value: '112',
          }
        ]
      },
      {
        label: '第二级',
        value: '12',
        children: [
          {
            label: '第三级',
            value: '121',
          },
          {
            label: '第三级',
            value: '122',
          }
        ]
      },
    ]
  },
  {
    label: '第一级',
    value: '2',
    children: [
      {
        label: '第二级',
        value: '21',
        children: [
          {
            label: '第三级',
            value: '211',
          },
          {
            label: '第三级',
            value: '212',
          }
        ]
      },
      {
        label: '第二级',
        value: '22',
        children: [
          {
            label: '第三级',
            value: '221',
          },
          {
            label: '第三级',
            value: '222',
          }
        ]
      },
    ]
  }
];