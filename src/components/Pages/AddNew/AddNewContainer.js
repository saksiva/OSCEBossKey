/* eslint-disable class-methods-use-this */

import React from "react";
import PropTypes from "prop-types";
import Hammer from "react-hammerjs";
import styled from "styled-components";

import { ActiveSwipe, InactiveSwipe } from "../Revision/SwipeBalls";
import InstructionText from "./InstructionText";

const WrapperDiv = styled.div`
  text-align: center;
`;

const StyledSwipeBallsDiv = styled.div`
  margin-bottom: 16px;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: row;
  margin-bottom: 16px;
  background-color: rgba(0, 159, 92, 0.2);
`;

const StyledInput = styled.input`
  font-family: "Roboto", Helvetica, sans-serif;
  background-color: rgba(0, 159, 92, 0);
  font-size: 20px;
  width: calc(100% - 64px);
  line-height: 1.2;
  padding: 16px;
  border: none;

  ::placeholder {
    color: rgba(0, 159, 92, 0.4);
  }

  :focus {
    outline-color: #c7c7b2;
  }
`;

const StyledButton = styled.input`
  padding: 0 16px;
  border: none;
  background-color: rgba(0, 159, 92, 0);
  color: #009f5c;
  font-size: 32px;

  :focus {
    outline-color: #c7c7b2;
  }
`;

const StyledTextArea = styled.textarea`
  resize: none;
  margin: 16px;
  padding: 8px;
  width: calc(100vw - 48px);
  height: calc(100vh - 322px);
  border: none;
  font-size: 16px;
  line-height: 1.2;
  font-family: "Roboto", Helvetica, sans-serif;

  :focus {
    outline-color: #c7c7b2;
  }
`;

const MarkSchemeList = styled.ul`
  width: 100%;
`;

const MarkSchemeListItem = styled.li`
  display: flex;
  margin: 4px 0;
  padding: 8px;
  align-items: center;
  color: ${({ added }) => added && "white"};
  background-color: ${({ added }) => (added ? "#009f5c" : "white")};
  text-align: left;
  word-wrap: break-word;
  word-break: break-word;
`;

export default class AddNewContainer extends React.Component {
  state = {
    newMarkSchemeElement: ""
  };

  handleChange = event => {
    this.setState({ newMarkSchemeElement: event.target.value });
  };

  handleSubmit = event => {
    const { newMarkSchemeElement } = this.state;
    event.preventDefault();
    event.target["new-mark-scheme-element"].value = "";
    if (newMarkSchemeElement)
      this.props.newMarkSchemeElement(newMarkSchemeElement);
  };

  render() {
    const markSchemeArray = this.props.markSchemeElements.map(
      (element, index) => (
        <MarkSchemeListItem
          added={element.added}
          key={index}
          onClick={() => this.props.markComplete(index)}
        >
          {element.text}
        </MarkSchemeListItem>
      )
    );
    return (
      <WrapperDiv>
        <StyledSwipeBallsDiv>
          {this.props.caseDetailsDisplayed ? (
            <React.Fragment>
              <ActiveSwipe swipe={this.props.swipe} />
              <InactiveSwipe swipe={this.props.swipe} />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <InactiveSwipe swipe={this.props.swipe} />
              <ActiveSwipe swipe={this.props.swipe} />
            </React.Fragment>
          )}
        </StyledSwipeBallsDiv>
        <Hammer onSwipe={this.props.swipe}>
          <div id="add-new-container">
            {this.props.caseDetailsDisplayed ? (
              <div id="add-new-text" data-testid="new-case-details">
                <InstructionText text={"Case details"} />
                <StyledTextArea
                  onChange={this.props.caseDetailsChange}
                  placeholder="Add patient details"
                  max-length="5000"
                />
              </div>
            ) : (
              <React.Fragment>
                <StyledForm onSubmit={this.handleSubmit}>
                  <StyledInput
                    type="text"
                    name="new-mark-scheme-element"
                    placeholder="Add new..."
                    onChange={this.handleChange}
                  />
                  {this.state.newMarkSchemeElement && (
                    <StyledButton type="submit" value="&#43;" />
                  )}
                </StyledForm>
                <MarkSchemeList
                  id="add-new-list"
                  data-testid="new-mark-scheme-list"
                >
                  {markSchemeArray}
                </MarkSchemeList>
              </React.Fragment>
            )}
          </div>
        </Hammer>
      </WrapperDiv>
    );
  }
}

AddNewContainer.propTypes = {
  markComplete: PropTypes.func,
  swipe: PropTypes.func,
  caseDetailsChange: PropTypes.func,
  caseDetailsDisplayed: PropTypes.bool,
  caseDetails: PropTypes.string,
  caseTitle: PropTypes.string,
  markSchemeElements: PropTypes.arrayOf(PropTypes.object),
  newMarkSchemeElement: PropTypes.func
};
