import React from "react";

interface ChangingTextProps {
  alt: string | React.ReactNode;
}

interface ChangingTextState {
  showAlt: boolean;
}

export default class ChangingText extends React.Component<
  ChangingTextProps,
  ChangingTextState
> {
  constructor(props: ChangingTextProps) {
    super(props);
    this.state = { showAlt: false };

    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  handleMouseEnter(): void {
    this.setState(() => ({
      showAlt: true,
    }));
  }

  handleMouseLeave(): void {
    this.setState(() => ({
      showAlt: false,
    }));
  }

  get displayText(): string | React.ReactNode {
    return this.state.showAlt ? this.props.alt : this.props.children;
  }

  render(): JSX.Element {
    return (
      <span
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {this.displayText}
      </span>
    );
  }
}
