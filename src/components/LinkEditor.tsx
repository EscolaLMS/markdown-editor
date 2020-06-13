import * as React from "react";
import { setTextSelection } from "prosemirror-utils";
import { EditorView } from "prosemirror-view";
import { Mark } from "prosemirror-model";
import {
  DocumentIcon,
  CloseIcon,
  PlusIcon,
  TrashIcon,
  OpenIcon,
} from "outline-icons";
import styled, { withTheme } from "styled-components";
import isUrl from "../lib/isUrl";
import theme from "../theme";
import Flex from "./Flex";
import Input from "./Input";
import ToolbarButton from "./ToolbarButton";
import LinkSearchResult from "./LinkSearchResult";

export type SearchResult = {
  title: string;
  url: string;
};

type Props = {
  mark?: Mark;
  from: number;
  to: number;
  tooltip: typeof React.Component;
  onRemoveLink?: () => void;
  onCreateLink?: (title: string) => Promise<void>;
  onSearchLink?: (term: string) => Promise<SearchResult[]>;
  onSelectLink: (options: {
    href: string;
    title?: string;
    from: number;
    to: number;
  }) => void;
  onClickLink: (url: string) => void;
  onShowToast?: (message: string, code: string) => void;
  view: EditorView;
  theme: typeof theme;
};

type State = {
  results: SearchResult[];
  value: string;
  selectedIndex: number;
};

class LinkEditor extends React.Component<Props, State> {
  discardInputValue = false;
  initialValue = this.href;
  initialSelectionLength = this.props.to - this.props.from;

  state: State = {
    selectedIndex: -1,
    value: this.href,
    results: [],
  };

  get href(): string {
    return this.props.mark ? this.props.mark.attrs.href : "";
  }

  componentWillUnmount = () => {
    // If we discarded the changes then nothing to do
    if (this.discardInputValue) {
      return;
    }

    // If the link is the same as it was when the editor opened, nothing to do
    if (this.state.value === this.initialValue) {
      return;
    }

    // If the link is totally empty or only spaces then remove the mark
    const href = (this.state.value || "").trim();
    if (!href) {
      return this.handleRemoveLink();
    }

    this.save(href, href);
  };

  save = (href: string, title?: string): void => {
    href = href.trim();

    this.discardInputValue = true;
    const { from, to } = this.props;

    // If the input doesn't start with a protocol or relative slash, make sure
    // a protocol is added to the beginning
    if (!isUrl(href) && !href.startsWith("/")) {
      href = `https://${href}`;
    }

    this.props.onSelectLink({ href, title, from, to });
  };

  handleKeyDown = (event: React.KeyboardEvent): void => {
    switch (event.key) {
      case "Enter": {
        event.preventDefault();
        const { selectedIndex, results, value } = this.state;
        const { onCreateLink } = this.props;

        if (selectedIndex >= 0) {
          const result = results[selectedIndex];
          if (result) {
            this.save(result.url, result.title);
          } else if (onCreateLink && selectedIndex === results.length) {
            this.handleCreateLink(value);
          }
        } else {
          // saves the raw input as href
          this.save(value, value);
        }

        if (this.initialSelectionLength) {
          this.moveSelectionToEnd();
        }

        return;
      }

      case "Escape": {
        event.preventDefault();

        if (this.initialValue) {
          this.setState({ value: this.initialValue }, this.moveSelectionToEnd);
        } else {
          this.handleRemoveLink();
        }
        return;
      }

      case "ArrowUp": {
        event.preventDefault();
        event.stopPropagation();
        const prevIndex = this.state.selectedIndex - 1;

        this.setState({
          selectedIndex: Math.max(0, prevIndex),
        });
        return;
      }

      case "ArrowDown":
      case "Tab": {
        event.preventDefault();
        event.stopPropagation();
        const total = this.state.results.length;
        const nextIndex = this.state.selectedIndex + 1;

        this.setState({
          selectedIndex: Math.min(nextIndex, total),
        });
        return;
      }
    }
  };

  handleFocusLink = (selectedIndex: number) => {
    this.setState({ selectedIndex });
  };

  handleChange = async (event): Promise<void> => {
    const value = event.target.value;
    const looksLikeUrl = isUrl(value);

    this.setState({
      value,
      results: looksLikeUrl ? [] : this.state.results,
      selectedIndex: -1,
    });

    // if it doesn't seem to be a url, try searching for matching documents
    if (value && !looksLikeUrl && this.props.onSearchLink) {
      try {
        const results = await this.props.onSearchLink(value);
        this.setState({ results });
      } catch (error) {
        console.error(error);
      }
    } else {
      this.setState({ results: [] });
    }
  };

  handleOpenLink = (event): void => {
    event.preventDefault();
    this.props.onClickLink(this.href);
  };

  handleCreateLink = (value: string) => {
    this.discardInputValue = true;
    const { onCreateLink } = this.props;

    if (onCreateLink) return onCreateLink(value);
  };

  handleRemoveLink = (): void => {
    this.discardInputValue = true;

    const { from, to, mark, view, onRemoveLink } = this.props;
    const { state, dispatch } = this.props.view;

    if (mark) {
      dispatch(state.tr.removeMark(from, to, mark));
    }

    if (onRemoveLink) {
      onRemoveLink();
    }

    view.focus();
  };

  handleSelectLink = (url: string, title: string) => event => {
    event.preventDefault();
    this.save(url, title);

    if (this.initialSelectionLength) {
      this.moveSelectionToEnd();
    }
  };

  moveSelectionToEnd = () => {
    const { to, view } = this.props;
    const { state, dispatch } = view;
    dispatch(setTextSelection(to)(state.tr));
    view.focus();
  };

  render() {
    const { theme } = this.props;
    const { value, results, selectedIndex } = this.state;

    const Tooltip = this.props.tooltip;
    const looksLikeUrl = value.match(/^https?:\/\//i);

    const showCreateLink =
      !!this.props.onCreateLink &&
      !(value === this.initialValue) &&
      !looksLikeUrl;

    const showResults = !!value && (showCreateLink || results.length > 0);

    return (
      <Wrapper>
        <Input
          value={value}
          placeholder={
            showCreateLink ? "Find or create a doc…" : "Search or paste a link…"
          }
          onKeyDown={this.handleKeyDown}
          onChange={this.handleChange}
          autoFocus={this.href === ""}
        />

        <ToolbarButton onClick={this.handleOpenLink} disabled={!value}>
          <Tooltip tooltip="Open link" placement="top">
            <OpenIcon color={theme.toolbarItem} />
          </Tooltip>
        </ToolbarButton>
        <ToolbarButton onClick={this.handleRemoveLink}>
          <Tooltip tooltip="Remove link" placement="top">
            {this.initialValue ? (
              <TrashIcon color={theme.toolbarItem} />
            ) : (
              <CloseIcon color={theme.toolbarItem} />
            )}
          </Tooltip>
        </ToolbarButton>

        {showResults && (
          <SearchResults id="link-search-results">
            {results.map((result, index) => (
              <LinkSearchResult
                key={result.url}
                title={result.title}
                icon={<DocumentIcon color={theme.toolbarItem} />}
                onMouseOver={() => this.handleFocusLink(index)}
                onClick={this.handleSelectLink(result.url, result.title)}
                selected={index === selectedIndex}
              />
            ))}

            {showCreateLink && (
              <LinkSearchResult
                key="create"
                title={`Create new doc “${value}”`}
                icon={<PlusIcon color={theme.toolbarItem} />}
                onMouseOver={() => this.handleFocusLink(results.length)}
                onClick={() => {
                  this.handleCreateLink(value);

                  if (this.initialSelectionLength) {
                    this.moveSelectionToEnd();
                  }
                }}
                selected={results.length === selectedIndex}
              />
            )}
          </SearchResults>
        )}
      </Wrapper>
    );
  }
}

const Wrapper = styled(Flex)`
  margin-left: -8px;
  margin-right: -8px;
  min-width: 336px;
`;

const SearchResults = styled.ol`
  background: ${props => props.theme.toolbarBackground};
  position: absolute;
  top: 100%;
  width: 100%;
  height: auto;
  left: 0;
  padding: 8px;
  margin: 0;
  margin-top: -3px;
  margin-bottom: 0;
  border-radius: 0 0 4px 4px;
  overflow-y: auto;
  max-height: 25vh;
`;

export default withTheme(LinkEditor);
