import * as React from "react";
import Editor from "..";
import { dark, light } from "../theme";

const docSearchResults = [
  {
    title: "Hiring",
    subtitle: "Created by Jane",
    url: "/doc/hiring",
  },
  {
    title: "Product Roadmap",
    subtitle: "Created by Tom",
    url: "/doc/product-roadmap",
  },
  {
    title: "Finances",
    subtitle: "Created by Coley",
    url: "/doc/finances",
  },
  {
    title: "Security",
    subtitle: "Created by Coley",
    url: "/doc/security",
  },
  {
    title: "Super secret stuff",
    subtitle: "Created by Coley",
    url: "/doc/secret-stuff",
  },
  {
    title: "Supero notes",
    subtitle: "Created by Vanessa",
    url: "/doc/supero-notes",
  },
  {
    title: "Meeting notes",
    subtitle: "Created by Rob",
    url: "/doc/meeting-notes",
  },
];

class YoutubeEmbed extends React.Component<{
  attrs: any;
  isSelected: boolean;
}> {
  render() {
    const { attrs } = this.props;
    const videoId = attrs.matches[1];

    return (
      <iframe
        className={this.props.isSelected ? "ProseMirror-selectednode" : ""}
        src={`https://www.youtube.com/embed/${videoId}?modestbranding=1`}
      />
    );
  }
}

const embeds = [
  {
    title: "YouTube",
    keywords: "youtube video tube google",
    defaultHidden: true,
    // eslint-disable-next-line react/display-name
    icon: () => (
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/7/75/YouTube_social_white_squircle_%282017%29.svg"
        width={24}
        height={24}
      />
    ),
    matcher: url => {
      return !!url.match(
        /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([a-zA-Z0-9_-]{11})$/i
      );
    },
    component: YoutubeEmbed,
  },
  {
    title: "Audio link",
    keywords: "audio sound mp3 video movie film mp4",
    // eslint-disable-next-line react/display-name
    icon: () => (
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/7/75/YouTube_social_white_squircle_%282017%29.svg"
        width={24}
        height={24}
      />
    ),
    matcher: url => {
      // FIXME support audio commonly used in language learning, like google translate, baidu in general
      const isAudio = url.match(
        /(?:https?:\/\/)?.*.(?:wav|mp3|ogg|m4a|&spd=2|mp3)(\?alt.*|)$/i
      );
      return isAudio;
    },
    component: () => <div>audio</div>,
  },
  {
    title: "Document link",
    keywords: "pdf word ppt presentation doc docx excel file",
    // eslint-disable-next-line react/display-name
    icon: () => (
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/7/75/YouTube_social_white_squircle_%282017%29.svg"
        width={24}
        height={24}
      />
    ),
    matcher: url => {
      const isDocument = url.match(
        /(?:https?:\/\/)?.*.(?:xlsx|xls|doc|docx|ppt|pptx|txt|pdf)(\?alt.*|)$/i
      );
      return isDocument;
    },
    component: () => <div>doc</div>,
  },
];

const onCreateFlashcard = (txt, surroundingTxt) =>
  console.log(`txt`, txt, surroundingTxt);

export default function Example(props) {
  const { body } = document;
  if (body)
    body.style.backgroundColor = props.dark
      ? dark.background
      : light.background;

  return (
    <div style={{ padding: "1em 2em" }}>
      <Editor
        onCreateFlashcard={onCreateFlashcard}
        onCreateLink={title => {
          // Delay to simulate time taken for remote API request to complete
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              if (title !== "error") {
                return resolve(
                  `/doc/${encodeURIComponent(title.toLowerCase())}`
                );
              } else {
                reject("500 error");
              }
            }, 1500);
          });
        }}
        onChange={val => console.log(`change`, val())}
        onSearchLink={async term => {
          console.log("Searched link: ", term);

          // Delay to simulate time taken for remote API request to complete
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(
                docSearchResults.filter(result =>
                  result.title.toLowerCase().includes(term.toLowerCase())
                )
              );
            }, Math.random() * 500);
          });
        }}
        uploadImage={file => {
          console.log("File upload triggered: ", file);

          // Delay to simulate time taken to upload
          return new Promise(resolve => {
            setTimeout(() => resolve("https://picsum.photos/600/600"), 1500);
          });
        }}
        uploadAudio={file => {
          console.log("Audio upload triggered: ", file);

          // Delay to simulate time taken to upload
          return new Promise(resolve => {
            setTimeout(
              () =>
                resolve(
                  "https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3"
                ),
              1500
            );
          });
        }}
        uploadFile={file => {
          console.log("File upload triggered: ", file);

          // Delay to simulate time taken to upload
          return new Promise(resolve => {
            setTimeout(
              () => resolve("http://www.africau.edu/images/default/sample.pdf"),
              1500
            );
          });
        }}
        uploadSketch={file => {
          console.log("File upload triggered: ", file);

          // Delay to simulate time taken to upload
          return new Promise(resolve => {
            setTimeout(
              () =>
                resolve(
                  "https://firebasestorage.googleapis.com/v0/b/alley-d0944.appspot.com/o/1gW8wsTYrsNFenWF1ERkCm5Isaz1%2Ftest.rsc"
                ),
              1500
            );
          });
        }}
        embeds={embeds}
        {...props}
      />
    </div>
  );
}
