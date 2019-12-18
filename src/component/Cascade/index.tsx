/**
 * Created by weinbin.shao on 2019/06/19.
 * 级联组件.
 */

import React, { PureComponent, Fragment } from 'react';
import { Card, Icon, Input } from 'antd';
import { util } from '../../util';

import styles from './index.less';

const noop = () => {};

// 默认校验函数
const defaultValidate = () => Promise.resolve(true);

/**
 * 构建级联数据
 */
const buildOptions = (itemKeys, options, selectedOptions, selectedValues) => {
  const newSelectedOptions = [...selectedOptions];
  if (!selectedOptions.length || !selectedOptions[0].length) {
    newSelectedOptions[0] = options;
  }

  itemKeys.forEach((item, index) => {
    if (index > 0) {
      // 上一级选中值
      const prevSelectedValue = selectedValues[index - 1];
      // 上一级选中项
      const prevSelectedItem =
        newSelectedOptions[index - 1].find(d => d.value === prevSelectedValue) || {};
      // 设置当前 options
      newSelectedOptions[index] = prevSelectedItem.children || [];
    }
  });

  return newSelectedOptions;
};

export class Cascade extends PureComponent {
  constructor(props) {
    super(props);

    const { defaultValue = [], options, itemKeys, onChange } = props;

    this.filterKeywords = {}; // 过滤条件关键字

    this.state = {
      selectedValues: defaultValue, // 选中值
      selectedOptions: [options || []], // 已选择级联数据
      prevDefaultValue: defaultValue,
      prevOptions: options,
    };

    // 调用 onChange, 防止有默认值时表单无法获取其值的问题
    if (
      defaultValue &&
      defaultValue.filter(value => value).length === itemKeys.length &&
      onChange
    ) {
      onChange(defaultValue);
    }
  }

  componentDidMount() {
    const { itemKeys, options } = this.props;
    const { selectedOptions, selectedValues } = this.state;
    this.setState({
      selectedOptions: buildOptions(itemKeys, options, selectedOptions, selectedValues),
    });
  }

  static getDerivedStateFromProps(props, state) {
    const { itemKeys, options, defaultValue = [] } = props;

    // 外部传入的 options 发生变化时重新赋值
    // 选中值发生变化时重新计算
    if (
      !util.isEqual(options, state.prevOptions) ||
      !util.isEqual(defaultValue, state.prevDefaultValue)
    ) {
      const selectedOptions = buildOptions(itemKeys, options, state.selectedOptions, defaultValue);

      return {
        prevOptions: options,
        prevDefaultValue: defaultValue,
        selectedOptions,
        selectedValues: defaultValue,
      };
    }

    return null;
  }

  /**
   * 获取过滤函数
   */
  filterFunc = key => {
    const keyword = this.filterKeywords[key];

    if (keyword) {
      const reg = RegExp(keyword, 'ig');
      return item => item.label.match(reg);
    }

    return () => true;
  };

  /**
   * 单击列表中的 item
   * 需要异步校验的逻辑, 校验不通过选择不生效
   * @param key 层级 key
   * @param e
   */
  handleItemClick = async (key, e) => {
    const { itemKeys, options, onChange = noop, onSelect = noop } = this.props;
    const { selectedValues: prevSelectedValues, selectedOptions } = this.state;
    const selectedItem = itemKeys.find(item => item.key === key);

    const { validate = defaultValidate } = selectedItem;

    // 获取选中 item 值
    const value = e.target.getAttribute('value');
    const level = itemKeys.findIndex(item => item.key === key);

    // 校验不通过直接返回
    if (!(await validate(key))) {
      return;
    }

    const selectedValues = prevSelectedValues.slice(0, level + 1);

    selectedValues[level] = value;

    this.setState({
      selectedValues,
      selectedOptions: buildOptions(itemKeys, options, selectedOptions, selectedValues), // 构建级联数据
    });

    // 选择完最后一级, 执行 onChange 回调
    if (level === itemKeys.length - 1 && onChange) {
      onChange(selectedValues);
    }

    onSelect(key, value);
  };

  /**
   * 过滤
   */
  handleSearch = (value, e, itemKey, itemIndex) => {
    const { options } = this.props;
    let { selectedOptions, selectedValues } = this.state;
    selectedOptions = selectedOptions.slice();
    selectedValues = selectedValues.slice();

    // 设置过滤关键字
    this.filterKeywords[itemKey] = value;

    if (value) {
      selectedOptions.forEach((items, index) => {
        if (itemIndex === index) {
          // 过滤掉不匹配的 item
          const filteredItems = items.filter(this.filterFunc(itemKey));
          // 判断选中项对应的 item 是否还存在, 不存在需要重新清空选中值
          const selectedItem = filteredItems.find(item => item.value === selectedValues[index]);
          if (!selectedItem) {
            selectedValues = selectedValues.slice(0, index);
          }
        }

        if (index > itemIndex) {
          // 上一级选中值
          const prevSelectedValue = selectedValues[index - 1];
          const findedIndex = selectedOptions[index - 1].findIndex(
            d => d.value === prevSelectedValue,
          );
          // 上一级对应的项不存在, 当前选择项置为空
          if (findedIndex === -1) {
            selectedOptions[index] = [];
          }
        }
      });

      this.setState({
        selectedOptions,
        selectedValues,
      });
    } else {
      // 第一级的过滤值为空时第一级展示所有项
      this.setState({
        selectedOptions: selectedOptions.map((items, index) => {
          if (index === 0 && itemIndex === 0) {
            return options;
          }
          return items;
        }),
      });
    }

    // 阻止默认事件, 防止触发表达的提交
    e.preventDefault();
  };

  render() {
    const { itemKeys, disabled } = this.props;
    const { selectedOptions, selectedValues } = this.state;

    return (
      <div
        className={util.classnames(styles.cascadeWrapper, {
          [styles.disabled]: disabled,
        })}
        value={selectedValues}
      >
        {itemKeys.map((item, index) => {
          const { key, title, className, options: itemOptions, renderItem, onClick } = item;
          // 优先使用外部传入的值
          const options = itemOptions || selectedOptions[index] || [];
          const selectedValue = selectedValues[index];
          const filterFunc = this.filterFunc(key);

          return (
            <div className={styles.cascadeItem} key={key}>
              <Card title={title} className={className} size="small">
                <div className={styles.header}>
                  <Input.Search
                    placeholder="请输入"
                    onSearch={(value, e) => this.handleSearch(value, e, key, index)}
                  />
                </div>
                {options.length ? (
                  <ul className={styles.list} onClick={e => this.handleItemClick(key, e)}>
                    {options.filter(filterFunc).map((child, childIndex) => (
                      <li
                        key={child.value}
                        value={child.value}
                        index={childIndex}
                        className={util.classnames(styles.item, {
                          [styles.active]: selectedValue === child.value,
                        })}
                        onClick={() => onClick && onClick(child.value, child)}
                      >
                        {typeof renderItem === 'function' ? (
                          renderItem(child, childIndex)
                        ) : (
                          <Fragment>
                            {child.label}
                            {index !== itemKeys.length - 1 && <Icon type="right" />}
                          </Fragment>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.placeholder}>
                    {index > 0 ? `请选择${itemKeys[index - 1].title}` : ''}
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    );
  }
}

/**
 * QuestionItem
 * question and answer
 */
const Item = props => {
  const { title, className, children } = props;
  return (
    <div>
      <Card title={title} className={className}>
        <ul>
          {children.map(item => (
            <li key={item.value} value={item.value}>
              {item.label}
              <Icon type="right" />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

Cascade.Item = Item;

