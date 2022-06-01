import uploadPlaceholderPlugin, {
  findPlaceholder,
} from "../lib/uploadPlaceholder";
import { ToastType } from "../types";

const insertFiles = function(view, event, pos, files, options) {
  // filter to only include image files
  const images = files; //.filter(file => /image/i.test(file.type));
  if (images.length === 0) return;
  const {
    dictionary,
    uploadImage,
    uploadSketch,
    onImageUploadStart,
    onImageUploadStop,
    onShowToast,
    embeds,
  } = options;

  if (!uploadImage && !uploadSketch) {
    console.warn("upload callback must be defined to handle image uploads.");
    return;
  }

  // okay, we have some dropped images and a handler – lets stop this
  // event going any further up the stack
  event.preventDefault();

  // let the user know we're starting to process the images
  if (onImageUploadStart) onImageUploadStart();

  const { schema } = view.state;

  // we'll use this to track of how many images have succeeded or failed
  let complete = 0;

  // the user might have dropped multiple images at once, we need to loop
  for (const file of images) {
    // Use an object to act as the ID for this upload, clever.
    const id = {};

    const { tr } = view.state;

    // insert a placeholder at this position
    tr.setMeta(uploadPlaceholderPlugin, {
      add: { id, file, pos },
    });
    view.dispatch(tr);

    // start uploading the image file to the server. Using "then" syntax
    // to allow all placeholders to be entered at once with the uploads
    // happening in the background in parallel.

    const isImage = file["type"].startsWith("image/");
    const isAudio = file["type"].startsWith("audio/");
    const isSketch =
      file.name.endsWith(".rsc") ||
      file.name.includes(".rsc?alt=") ||
      (!uploadImage && uploadSketch);
    const uploadCallback = isSketch
      ? uploadSketch
      : uploadImage || uploadSketch;
    uploadCallback(
      file,
      isImage ? "image" : isAudio ? "audio" : null,
      isImage || isAudio
    )
      .then(src => {
        const pos = findPlaceholder(view.state, id);

        // if the content around the placeholder has been deleted
        // then forget about inserting this image
        if (pos === null) return;

        // otherwise, insert it at the placeholder's position, and remove
        // the placeholder itself
        let transaction;
        console.log(`isImage`, isImage, isSketch, file.name);
        if (isImage && !isSketch) {
          transaction = view.state.tr
            .replaceWith(pos, pos, schema.nodes.image.create({ src }))
            .setMeta(uploadPlaceholderPlugin, { remove: { id } });
        } else {
          let component;
          if (embeds) {
            for (const embed of embeds) {
              const matches = embed.matcher(src);
              if (matches) {
                component = embed.component;
              }
            }
          }
          console.log(`component`, component, src, embeds);
          transaction = view.state.tr
            .replaceWith(
              pos,
              pos,
              schema.nodes.embed.create({ href: src, component, matches: {} })
            )
            .setMeta(uploadPlaceholderPlugin, { remove: { id } });
        }
        view.dispatch(transaction);
      })
      .catch(error => {
        console.error(error);

        // cleanup the placeholder if there is a failure
        const transaction = view.state.tr.setMeta(uploadPlaceholderPlugin, {
          remove: { id },
        });
        view.dispatch(transaction);

        // let the user know
        if (onShowToast) {
          onShowToast(dictionary.imageUploadError, ToastType.Error);
        }
      })
      // eslint-disable-next-line no-loop-func
      .finally(() => {
        complete++;

        // once everything is done, let the user know
        if (complete === images.length) {
          if (onImageUploadStop) onImageUploadStop();
        }
      });
  }
};

export default insertFiles;
