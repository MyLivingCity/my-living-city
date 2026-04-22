import React from "react";
import { Form } from "react-bootstrap";
import { capitalize, removeDuplicates } from "src/lib/utils";
import { type CheckBoxItem } from "../../../types/segment.types";

interface CheckboxTreeProps {
  data: CheckBoxItem[];
  parent: CheckBoxItem | null;
  selected: number[];
  setSelected: React.Dispatch<React.SetStateAction<number[]>>;
}
export const CheckboxTree: React.FC<CheckboxTreeProps> = ({
  data,
  parent,
  selected,
  setSelected,
}) => {
  const getAllLeafChildren = (
    items: CheckBoxItem[],
    leafChildren: CheckBoxItem[],
  ) => {
    items.forEach((item) => {
      if (!item.children) {
        leafChildren.push(item);
      } else {
        getAllLeafChildren(item.children, leafChildren);
      }
    });
  };

  const setCheckboxesChecked = (items: CheckBoxItem[], isChecked: boolean) => {
    items.forEach((item) => {
      const el = document.getElementById(
        `${item.value}`,
      ) as HTMLInputElement | null;
      if (el) el.checked = isChecked;
    });
  };

  const onChangeCallback = (
    e: React.ChangeEvent<HTMLInputElement>,
    childrenItems: CheckBoxItem[] | undefined,
    siblings: CheckBoxItem[] | undefined,
  ) => {
    const isChecked = e.target.checked;
    let selectedCopy = [...selected];

    if (childrenItems && childrenItems.length > 0) {
      const leafChildren: CheckBoxItem[] = [];
      getAllLeafChildren(childrenItems, leafChildren);
      const allChildren = removeDuplicates([...childrenItems, ...leafChildren]);
      setCheckboxesChecked(allChildren, isChecked);

      if (isChecked) {
        leafChildren.forEach((child) => {
          if (!selectedCopy.includes(child.value as number))
            selectedCopy.push(child.value as number);
        });
      } else {
        leafChildren.forEach((child) => {
          const index = selectedCopy.indexOf(child.value as number);
          if (index !== -1) selectedCopy.splice(index, 1);
        });
      }
    } else {
      const id = Number(e.target.id);
      if (isChecked) {
        if (!selectedCopy.includes(id)) selectedCopy = [...selectedCopy, id];
      } else {
        const index = selectedCopy.indexOf(id);
        if (index !== -1) selectedCopy.splice(index, 1);
      }
    }

    setSelected([...selectedCopy]);

    if (parent !== null) {
      const areSiblingsChecked =
        siblings?.every((sibling) => {
          const el = document.getElementById(
            `${sibling.value}`,
          ) as HTMLInputElement | null;
          return el ? el.checked : false;
        }) ?? true;

      const parentEl = document.getElementById(
        `${parent.value}`,
      ) as HTMLInputElement;
      if (parentEl) parentEl.checked = isChecked && areSiblingsChecked;
    }
  };

  const getSiblings = (item: CheckBoxItem) => data.filter((el) => el !== item);

  const treeDiv: React.CSSProperties = { marginLeft: "20px" };

  return (
    <div style={treeDiv}>
      {data.map((item, i) => (
        <div key={i}>
          <input
            type="checkbox"
            id={item.value.toString()}
            onChange={(e) =>
              onChangeCallback(e, item.children, getSiblings(item))
            }
          />
          <Form.Label style={{ paddingLeft: "10px" }}>
            {item.label && capitalize(item.label)}
          </Form.Label>
          {item.children && (
            <CheckboxTree
              data={item.children}
              parent={item}
              selected={selected}
              setSelected={setSelected}
            />
          )}
        </div>
      ))}
    </div>
  );
};
