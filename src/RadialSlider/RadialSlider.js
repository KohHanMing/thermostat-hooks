import React from 'react';
import './RadialSlider.css'

class RadialSlider extends React.Component {
    /* This method returns the JSX for the radial slider which includes the slider, thermostat mode, current and target temperature. */
    render() {
        return (
            <div className="slider-svg">
                <svg xmlns="http://www.w3.org/2000/svg"  width={this.props.sliderRectLength} height={this.props.sliderRectLength}>
                    <circle 
                        cx={this.props.sliderRectLength / 2} cy={this.props.sliderRectLength / 2} r={this.props.sliderRectLength / 2 * 0.9} 
                        fill={this.props.sliderColour} className="slider-radial" 
                    />
                    <rect 
                        x="25%" y="20%" rx="20" ry="20" width={this.props.sliderRectLength / 2} height={this.props.sliderRectLength / 8} 
                        fill={this.props.modeColour} className="thermostat-mode" 
                    />
                    <text x="50%" y="28%" textAnchor="middle" className="text font-temp-small">Mode: {this.props.mode}</text>
                    <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="text font-temp-large">{this.props.targTemp}</text>
                    <text x="50%" y="70%" textAnchor="middle" className="text font-temp-medium">Current: {this.props.currTemp}</text>
                </svg>
            </div>
        );
    }
};

export default RadialSlider;