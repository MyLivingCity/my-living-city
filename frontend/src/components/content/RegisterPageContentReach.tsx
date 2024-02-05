import React, { Dispatch} from 'react'
import { Form } from 'react-bootstrap';
import { capitalizeFirstLetterEachWord, getDuplicatesRemoved } from './../../lib/utilityFunctions';
import CSS from 'csstype';


export type CheckBoxItem = {
    label: string | undefined;
    value: any;
    children?: CheckBoxItem[];
};

interface RegisterPageContentReachProps {
    data: CheckBoxItem[]
    selected: any
    setSelected: Dispatch<any>
}

export const RegisterPageContentReach: 
    React.FC<RegisterPageContentReachProps> = ({data, selected, setSelected}) => {
        return (
            <div>
                <h3>Please select your advertisement targeted users:</h3>
                <CheckboxTree data={data} parent={null} selected={selected} setSelected={setSelected}/>
            </div>
        );
}

interface CheckBoxTreeProps {
    data: CheckBoxItem[]
    parent: CheckBoxItem | null
    [key: string]:any
}

export const CheckboxTree: React.FC<CheckBoxTreeProps> = ({data, parent, ...props}: CheckBoxTreeProps) => {

    /**
     * Note: this function does not return the leaf children, instead it populates it with
     * 
     * @param items Given a list of Checkbox items, it populate the leafChildren with all leaf children from the given items
     * @param leafChildren list of CheckboxItems that is being populated
     */
    const getAllLeaveChildrenItems = (items: CheckBoxItem[], leafChildren: CheckBoxItem[]) => {
        items.forEach(item => {
            if (!item.children) {
                leafChildren.push(item);
            } else {
                getAllLeaveChildrenItems(item.children, leafChildren);
            }
        });
    }

    /**
     * Set the items' checked attribute to the value in isChecked
     * @param items list of CheckboxItems
     * @param isChecked whether the items are going to be checked or not
     */
    const setCheckboxesChecked = (items: CheckBoxItem[], isChecked: boolean) => {
        items.forEach(item=> {
            let itemElement = document.getElementById(`${item.value}`) as HTMLInputElement | null;
            if (itemElement !== null) itemElement.checked = isChecked;
        });
    }

    /**
     * Handles when a checkbox is checked or unchecked
     * @param e event
     * @param childrenItems list of immediate children of the element inw which the event is triggered from
     */
    const onChangeCallback = (e: any, childrenItems: CheckBoxItem[] | undefined, siblings: CheckBoxItem[] | undefined) => {
        const isCheckboxChecked: boolean = e.target.checked;

        let selectedCopy = props.selected;
        if (childrenItems && childrenItems.length > 0) {
            let leafChildren: CheckBoxItem[] = [];
            getAllLeaveChildrenItems(childrenItems, leafChildren);
            
            let allChildren: CheckBoxItem[] = [...childrenItems, ...leafChildren];
            allChildren = getDuplicatesRemoved(allChildren); // leafChildren can be childrenItems
            setCheckboxesChecked(allChildren, isCheckboxChecked);

            if (isCheckboxChecked) { // Checked
                leafChildren.forEach(child => {
                    if (!selectedCopy.includes(child.value)) selectedCopy.push(child.value);
                });
            } else { // Unchecked
                leafChildren.forEach(child => {
                    if (selectedCopy.includes(child.value)) {
                        const index = selectedCopy.indexOf(child.value);
                        selectedCopy.splice(index, 1);
                    }
                });
            }
        } else {
            if (isCheckboxChecked) { // Checked
                if (!selectedCopy.includes(Number(e.target.id))) selectedCopy = [...selectedCopy, Number(e.target.id)];
            } else { // Unchecked
                const index = selectedCopy.indexOf(Number(e.target.id));
                if (index !== -1) selectedCopy.splice(index, 1);
            }
        }
        props.setSelected([...selectedCopy]);

        // Update parent's checkbox
        if (parent !== null) {
            let areSiblingsChecked = true;
            siblings && siblings.forEach(sibling => {
                const siblingElem = document.getElementById(`${sibling.value}`) as HTMLInputElement | null;
                if (siblingElem !== null) {
                    areSiblingsChecked = areSiblingsChecked && siblingElem.checked;
                }
            });

            let parentElem = document.getElementById(`${parent.value}`) as HTMLInputElement;
            parentElem.checked = isCheckboxChecked && areSiblingsChecked;
        }
    }

    /**
     * Return the siblings of this item
     * @param item a CheckboxItem
     * @returns siblings of this Checkbox item
     */
    const getSiblings = (item: CheckBoxItem) => {
        const siblings = data.filter(element => element !== item);
        return siblings;
       
    }

    const treeDiv: CSS.Properties = {
        marginLeft: '20px',
    }

    return (
        <div style={treeDiv}>
            {data && data.map((item, i) => {
                return(
                    <div key={i}>
                        <input type="checkbox" id={item.value} onChange={(e) => {onChangeCallback(e, item.children, getSiblings(item))}}/>
                        <Form.Label style={{paddingLeft: '10px'}}>{item.label && capitalizeFirstLetterEachWord(item.label)}</Form.Label>
                        {item.children && <CheckboxTree data={item.children} parent={item} selected={props.selected} setSelected={props.setSelected}/>}
                    </div>
                )
            })}
        </div>
    )
}