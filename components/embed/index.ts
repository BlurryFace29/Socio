import Image from "./Image";
import Video from "./Video";
import Hashtag from "./Hashtag";
import Url from "./Url";
import Youtube from "./YouTube";
import Instagram from "./Instagram";
import Twitter from "./Twitter";
import SoundCloud from "./SoundCloud";
import Spotify from "./Spotify";

export type EmbedProps = {
  match: string,
  index?: number
}

type Embed = {
  regex: RegExp;
  Component: (props: EmbedProps) => JSX.Element;
}

export const allEmbeds = [
  Image,
  Video,
  Youtube,
  Instagram,
  Twitter,
  SoundCloud,
  Spotify,
  Hashtag,
  Url,
];

// Excluded for now: NostrNpub, NostrEvent, Nip19, InlineMention

export default Embed;