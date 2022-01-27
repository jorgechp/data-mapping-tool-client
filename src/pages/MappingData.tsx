import React, {Fragment, useState} from "react";
import {Outlet, useNavigate} from "react-router-dom";
import store from "../store";
import {Button, Steps} from "antd";
import {setIndex} from "../actions/mapping_actions";

const {Step} = Steps;
const MappingData = () => {
    const [current, setCurrent] = useState(store.getState().mapping.index);
    const [nextStep, setNextStep] = useState(true)
    const [prevStep, setPrevStep] = useState(true)
    const [doneStep, setDoneStep] = useState(true)
    const navigate = useNavigate();

    const [steps, setSteps] = useState([
        {
            title: 'Map Classes',
        },
        {
            title: 'Map Data Properties',
        }
    ]);

    const handleNavigation = (index: number) => {
        switch (index) {
            case 0:
                navigate("classes/")
                break
            case 1:
                navigate("properties/data/")
                break
        }
        setCurrent(index);
        store.dispatch(setIndex(index));
        console.log(store.getState())
    }


    const next = () => {
        handleNavigation(current + 1)
    };

    const prev = () => {
        handleNavigation(current - 1)
    };

    const done = () => {

    }

    let unsubscribe = store.subscribe(() => {
        switch (store.getState().mapping.index) {
            case 0: // upload
                setNextStep(true);
                break

            case 1: // sample
                setNextStep(true);
                setPrevStep(true);
                break

            case 2: // select
                setDoneStep(true);
                setPrevStep(true);
                break
        }
    });


    return (<Fragment>
        <Steps current={current}>
            {steps.map(item => (
                <Step key={item.title} title={item.title}/>
            ))}
        </Steps>

        <div className="steps-content">
            <Outlet/>
        </div>

        <div className="steps-action">
            {current < steps.length - 1 && (
                <Button type="primary" disabled={!nextStep} onClick={() => next()}>
                    Next
                </Button>
            )}

            {current === steps.length - 1 && (
                <Button type="primary" disabled={!doneStep} onClick={done}>
                    Done
                </Button>
            )}
            {current > 0 && (
                <Button style={{margin: '0 8px'}} disabled={!prevStep} onClick={() => prev()}>
                    Previous
                </Button>
            )}
        </div>
    </Fragment>)
}
export default MappingData;