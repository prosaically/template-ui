import {DescriptionEntry, CheckboxEntry, isCheckboxEntryEdited, useError} from "@bpmn-io/properties-panel";
import {useService} from "bpmn-js-properties-panel";
import {getBusinessObject} from "bpmn-js/lib/util/ModelUtil";
import {jsx, jsxs} from "@bpmn-io/properties-panel/preact/jsx-runtime";
import {useEffect, useState} from "@bpmn-io/properties-panel/preact/hooks";

const LOW_PRIORITY = 300;

function CustomAssigneeOptional({element}) {
    const translate = useService("translate");
    const businessObject = getBusinessObject(element);
    const commandStack = useService("commandStack");

    return CheckboxEntry({
        element,
        id: "assigneeOptional",
        label: translate("Optional"),
        getValue: () => businessObject.get("custom:assigneeOptional"),
        setValue: value =>
            commandStack.execute("element.updateModdleProperties", {
                element,
                moddleElement: businessObject,
                properties: {"custom:assigneeOptional": value, "custom:assigneeContent": undefined}
            })
    });
}

function CustomAssigneeMultiple({element}) {
    const commandStack = useService("commandStack");
    const translate = useService("translate");
    const businessObject = getBusinessObject(element);

    return CheckboxEntry({
        element,
        id: "assigneeMultiple",
        label: translate("Multiple"),
        getValue: () => businessObject.get("custom:assigneeMultiple"),
        setValue: value =>
            commandStack.execute("element.updateModdleProperties", {
                element,
                moddleElement: businessObject,
                properties: {"custom:assigneeMultiple": value, "custom:assigneeContent": undefined}
            })
    });
}

function ExhibitEntry({element, id, description, label, getValue, validate, onClick}) {
    const globalError = useError(id);
    const [localError, setLocalError] = useState(null);

    let value = getValue(element);
    useEffect(() => {
        if (typeof validate === "function") {
            const newValidationError = validate(value) || null;
            setLocalError(newValidationError);
        }
    }, [value]);

    const error = globalError || localError;
    return jsxs("div", {
        class: `bio-properties-panel-entry ${error ? "has-error" : ""}`,
        "data-entry-id": id,
        children: [
            jsx("label", {class: "bio-properties-panel-label", children: label}),
            jsx("div", {
                id: `bio-properties-panel-${id}`,
                name: id,
                class: "bio-properties-panel-exhibit",
                children: value,
                onClick
            }),
            error && jsx("div", {class: "bio-properties-panel-error", children: error}),
            jsx(DescriptionEntry, {forId: id, element: element, value: description})
        ]
    });
}

function isExhibitEntryEdited(node) {
    return false;
}

function CustomAssigneeContent({element}) {
    const id = "assigneeContent";
    const commandStack = useService("commandStack");
    const bpmnFactory = useService("bpmnFactory");
    const translate = useService("translate");
    const eventBus = useService("eventBus");
    const businessObject = getBusinessObject(element);

    eventBus.off(`${id}.input`);
    eventBus.on(`${id}.input`, inputEvent => {
        let nodeId = businessObject.get("id");
        if (nodeId === undefined || nodeId === null || nodeId === "") {
            return;
        }

        let loopCharacteristics = businessObject.loopCharacteristics;
        if (loopCharacteristics) {
            const completionConditionElement = bpmnFactory.create("bpmn:FormalExpression", {
                body: "${nrOfInstances == nrOfCompletedInstances}"
            });
            completionConditionElement.$parent = loopCharacteristics;
            commandStack.execute("properties-panel.multi-command-executor", [
                {
                    cmd: "element.updateModdleProperties",
                    context: {
                        element,
                        moddleElement: loopCharacteristics,
                        properties: {completionCondition: completionConditionElement}
                    }
                },
                {
                    cmd: "element.updateModdleProperties",
                    context: {
                        element,
                        moddleElement: loopCharacteristics,
                        properties: {
                            "camunda:collection": "${candidate_" + nodeId + "}",
                            "camunda:elementVariable": "assignee_" + nodeId
                        }
                    }
                },
                {
                    cmd: "element.updateModdleProperties",
                    context: {
                        element,
                        moddleElement: businessObject,
                        properties: {
                            "custom:assigneeContent": inputEvent.value,
                            "camunda:assignee": "${assignee_" + nodeId + "}",
                            "camunda:candidateUsers": undefined
                        }
                    }
                }
            ]);
        } else {
            let multipleValue = businessObject.get("custom:assigneeMultiple");
            let isMultiple = multipleValue === true || multipleValue === "true";
            commandStack.execute("element.updateModdleProperties", {
                element,
                moddleElement: businessObject,
                properties: {
                    "custom:assigneeContent": inputEvent.value,
                    "camunda:candidateUsers": isMultiple ? "${candidate_" + nodeId + "}" : undefined,
                    "camunda:assignee": isMultiple ? undefined : "${assignee_" + nodeId + "}"
                }
            });
        }
    });

    return ExhibitEntry({
        element,
        id,
        label: translate("Content"),
        description: translate("Click to complete user assignment"),
        getValue: () => businessObject.get("custom:assigneeContent"),
        validate: value => {
            if (value === undefined || value === null || value === "") {
                return undefined;
            }
            for (let nodeValue of value.split(/ *, */)) {
                if (/^(user|role|group|leader)-\d+$/.test(nodeValue)) {
                    continue;
                }
                return translate("The input value does not meet the specifications");
            }
            return undefined;
        },
        onClick: () =>
            eventBus.fire(`${id}.open`, {
                assigneeOptional: businessObject.get("custom:assigneeOptional"),
                assigneeMultiple: businessObject.get("custom:assigneeMultiple"),
                assigneeContent: businessObject.get("custom:assigneeContent")
            })
    });
}

function updateUserAssignmentGroup(groups, element) {
    let userAssignmentGroup = groups.find(g => g.id === "CamundaPlatform__UserAssignment");
    if (userAssignmentGroup === undefined) {
        return;
    }

    const {entries} = userAssignmentGroup;
    entries
        .map((entry, index) => {
            if (["assignee", "candidateGroups", "candidateUsers"].includes(entry.id)) {
                return index;
            }
            return -1;
        })
        .filter(indexValue => indexValue > -1)
        .sort((a, b) => b - a)
        .forEach(deleteIndex => entries.splice(deleteIndex, 1));

    entries.unshift(
        {id: "userAssignmentOptional", component: CustomAssigneeOptional, isEdited: isCheckboxEntryEdited},
        {id: "userAssignmentMultiple", component: CustomAssigneeMultiple, isEdited: isCheckboxEntryEdited},
        {id: "userAssignmentContent", component: CustomAssigneeContent, isEdited: isExhibitEntryEdited}
    );
}

/**
 * A provider with a `#getGroups(element)` method that exposes groups for a diagram element.
 *
 * @param {PropertiesPanel} propertiesPanel
 */
const CustomPropertiesProviderModule = function (propertiesPanel) {
    /**
     * Return the groups provided for the given element.
     *
     * @param {DiagramElement} element
     * @return {(Object[]) => (Object[])} groups middleware
     */
    this.getGroups = function (element) {
        /**
         * We return a middleware that modifies the existing groups.
         *
         * @param {Object[]} groups
         * @return {Object[]} modified groups
         */
        return groups => {
            updateUserAssignmentGroup(groups, element);
            return groups;
        };
    };

    // Register our custom properties provider.
    // Use a lower priority to ensure it is loaded after the basic BPMN properties.
    propertiesPanel.registerProvider(LOW_PRIORITY, this);
};

CustomPropertiesProviderModule.$inject = ["propertiesPanel"];

export default {
    __init__: ["customPropertiesProviderModule"],
    customPropertiesProviderModule: ["type", CustomPropertiesProviderModule]
};
