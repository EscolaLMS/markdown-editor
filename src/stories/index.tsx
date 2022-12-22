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
    title: "Sketch / Image Occlusion",
    keywords: "sketch image occlusion scratchpad",
    matcher: url => {
      const isSketch = url.match(/(?:https?:\/\/)?.*.(?:rsc)(\?alt.*|)$/i);
      return isSketch;
    },
    component: () => <div>sketch</div>,
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

const LinkFinder = ({ callback }) => {
  console.log(`linkfinder`);

  return (
    <div
      onClick={() =>
        callback({
          href: "/dominiczijlstra/gfcek2fp7un0nzc079n78n59",
          title: "hi",
        })
      }
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      HELLO
    </div>
  );
};

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
        enableTemplatePlaceholder={true}
        templatePlaceholderAsQuestion={true}
        onMakeAnswer={txt => console.log(`make answer2`, txt)}
        onChange={val => console.log(`change`, val())}
        uploadImage={file => {
          console.log("File upload triggered: ", file);

          // Delay to simulate time taken to upload
          return new Promise(resolve => {
            setTimeout(() => resolve("https://picsum.photos/600/600"), 1500);
          });
        }}
        LinkFinder={LinkFinder}
        excludeBlockMenuItems={[]}
        uploadSketch={file => {
          console.log("Sketch upload triggered: ", file);

          // Delay to simulate time taken to upload
          return new Promise(resolve => {
            setTimeout(
              () =>
                resolve(
                  "https://firebasestorage.googleapis.com/v0/b/alley-d0944.appspot.com/o/dominiczijlstra%2F1654057020.rsc?alt=media&token=6c75583e-8dd8-4a6b-83af-fe96a4861e1e"
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
