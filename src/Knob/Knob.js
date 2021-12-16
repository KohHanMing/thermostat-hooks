import React from 'react';
import './Knob.css'

class Knob extends React.Component {
    /* This method returns the JSX for the knob. */
    render() {
        return (
            <div className="knob">
                <svg xmlns="http://www.w3.org/2000/svg" width={this.props.knobRectLength} height={this.props.knobRectLength} className="slider-knob" >
                    <circle cx={this.props.knobRectLength / 2} cy={this.props.knobRectLength / 2} r={this.props.knobRectLength / 2 * 0.8} />
                </svg>
            </div>
        );
    }
};

export default Knob;