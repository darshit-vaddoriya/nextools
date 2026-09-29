// Article bodies for the "media" topic, split out of posts/media.ts.
//
// Bodies are only needed when an article is actually rendered, so they live in
// their own chunk. Keeping them beside the post metadata put every article on
// the site into the entry bundle — downloaded by the homepage and every tool
// page, which never display an article body.
export const MEDIA_BODIES: Record<string, string> = {
  'mp4-is-not-a-codec': `Someone sends you a video. It downloads, it has a sensible size, and your player shows a black rectangle with working audio. Someone else opens the same file and it is fine.

Nothing is corrupt. The file is carrying something your player cannot decode, and the extension gave you no warning because the extension does not describe that.

## Three separate things in one file

A video file is a container holding streams:

- **The container** — MP4, MKV, MOV, WebM, AVI. It stores the streams, their timing, chapter marks and metadata. Think of it as the box and the packing list.
- **The video codec** — H.264, HEVC (H.265), VP9, AV1. This is the compression scheme the picture is stored in.
- **The audio codec** — AAC, MP3, Opus, FLAC, AC-3.

"MP4" tells you about the box. It tells you almost nothing about whether the contents will play, because an MP4 can legally hold H.264 or HEVC or AV1, and the same goes for the audio. This is the same gap between a file's name and its actual contents that makes [MIME types and magic bytes](/blog/mime-types-and-file-signatures) worth understanding — the extension is a claim, not a description.

This is why "convert to MP4" is an incomplete instruction. If the file is already an MP4 with HEVC inside and the target device only decodes H.264, converting it to another MP4 with the same codecs achieves nothing.

> [!NOTE]
> The quickest diagnosis is to read the streams rather than guess. A video metadata reader lists the container, the video codec, the audio codec, resolution, frame rate and bit rate. Once you can see "HEVC / AAC", the black rectangle stops being mysterious.

## The combinations that actually matter

**H.264 video + AAC audio in an MP4.** The safe default. Every browser, phone, TV and editing program made in the last fifteen years decodes it. It is not the most efficient option any more, and that is the price of it working everywhere.

**HEVC (H.265).** Roughly half the bit rate of H.264 for the same quality, which is why phones record in it. Patent licensing kept it out of some browsers, so a clip that plays perfectly on the phone that shot it can fail on a laptop.

**VP9 and AV1 in WebM or MP4.** Royalty-free, very efficient, widely supported in browsers and increasingly in hardware. AV1 encoding is slow, so the win is on the delivery side rather than the working side.

**MKV.** A capable container that holds almost anything, including multiple audio tracks and subtitle tracks. Browsers do not play it and some TVs refuse it, which is why a perfectly good MKV often needs to be remuxed into an MP4.

## Remux versus re-encode

These are different operations and the difference is worth minutes of your life.

**Remuxing** takes the existing streams and writes them into a different container. No pixels are decoded, nothing is re-compressed, quality is untouched and it takes seconds. This is the right operation when MKV-to-MP4 is the whole problem.

**Re-encoding** decodes every frame and compresses it again with a different codec or different settings. It takes real time, and it is lossy: the second encode cannot recover detail the first one discarded. This is what you need when the codec itself is the incompatibility.

The practical rule: change the container when the player rejects the file outright, change the codec when the player opens the file but cannot draw it.

> [!WARNING]
> Every re-encode is generational loss. Converting H.264 to HEVC and back to H.264 leaves you with the artefacts of both encodes and a file no smaller than where you started. Convert from the highest-quality copy you have, not from something already converted twice.

## Frame rate, resolution and bit rate

Three numbers get conflated constantly.

**Resolution** is how many pixels per frame: 1920×1080, 3840×2160. Lowering it is the single biggest lever on file size, because the pixel count falls with the square.

**Frame rate** is frames per second: 24, 30, 60. Halving it halves the frames to encode but makes motion visibly less smooth, which is obvious on screen recordings and sport, and barely noticeable on a talking head.

**Bit rate** is bits per second of playback, and it is the one that actually determines file size: file size ≈ bit rate × duration. A "1080p" file can be 2 Mbps or 20 Mbps, and those look very different.

When a file is too large for an upload limit, the order to try is: lower the bit rate, then the resolution, then the frame rate. Converting the file with an explicit target rather than a vague "compress" setting is how you land near a limit on the first attempt.

## Audio has the same structure

The same container-and-codec split applies to audio-only files. An \`.m4a\` is a container that usually holds AAC. An \`.ogg\` usually holds Vorbis or Opus. MP3 is unusual in being both a container and a codec, which is part of why it is the format people assume everything works like.

Converting between them is a re-encode unless you are only rewrapping, so going MP3 → WAV does not restore anything that MP3 threw away; it just stores the same degraded audio without compression. An audio converter is the right tool for producing the format something demands, not for improving quality that has already gone.

## A short diagnostic

1. Read the file's streams. Container, video codec, audio codec.
2. Picture missing, sound fine → the video codec is unsupported.
3. Sound missing, picture fine → the audio codec is unsupported, often AC-3 in a browser.
4. Nothing opens at all → the container is unsupported. Remux; do not re-encode.
5. Plays but is too big → bit rate, then resolution, then frame rate.

When the diagnosis points at the container, [MOV to MP4](/tool/mov-to-mp4) and [WebM to MP4](/tool/webm-to-mp4) turn the two most common problem files into MP4, and the [video converter](/tool/video-converter) covers the other combinations between MP4, WebM, MOV and MKV. Reading a container's stream list is something a player or a local inspector such as \`ffprobe\`, MediaInfo or VLC's codec panel will tell you in seconds, without the file going anywhere. That matters when the clip is a recording of an internal meeting that should not be uploaded to a stranger's server just to find out which codec it uses.`,
  'compressing-a-video-without-ruining-it': `An upload rejects your file at 25 MB and the recording is 200 MB. The temptation is to run a "compress" button until something fits. That works, but it usually gives up far more quality than it had to, because the three dials that make a video smaller do not degrade it equally.

## The arithmetic

File size is, near enough, bit rate multiplied by duration:

\`\`\`
size (MB) ≈ (video kbps + audio kbps) × duration (s) ÷ 8 ÷ 1000
\`\`\`

Run that backwards to hit a limit. For 25 MB and a 4-minute (240 s) clip:

\`\`\`
total kbps = 25 × 8 × 1000 ÷ 240 ≈ 833 kbps
\`\`\`

Leave 96 kbps for audio and the video gets roughly 730 kbps. Now the question is a concrete one — does this footage look acceptable at 730 kbps — instead of a vague one about how much to compress.

At that budget, 1080p will look soft and blocky on movement. 720p will look reasonable. 480p will look clean but small. That is the trade being made, and making it deliberately beats discovering it after the upload. The underlying principle is the one [image compression](/blog/how-image-compression-works) runs on: quality is what you spend bits on, and fewer pixels means fewer bits to spend. If the target is an email rather than an upload form, attachment limits are stricter than the number they advertise.

## Which dial, in which order

**Bit rate, first.** Most footage recorded on a phone or a screen recorder is encoded far above what it needs. Screen recordings in particular are mostly static pixels and compress enormously well. Dropping the bit rate by half often costs nothing you can see.

**Resolution, second.** Halving each dimension quarters the pixel count, so 1080p → 720p is a large saving, and it is the correct move once the bit rate is low enough that 1080p has started to break up. A clean 720p beats a smeared 1080p every time.

**Frame rate, last.** Going 60 → 30 saves real space, but motion judder is more noticeable than softness, especially in game capture, sport or fast scrolling. For a static talking head or a slide presentation, 30 → 24 or even 15 is invisible and saves a lot.

> [!NOTE]
> Before touching any of the three, cut the clip. Duration multiplies everything, so removing eleven seconds of you fumbling for the right window at the start removes eleven seconds of bits. Trimming first and compressing second is nearly always the order that produces the smallest watchable file.

## Why the same settings give different results

Two clips at identical settings can come out at wildly different sizes, because codecs encode *change*, not frames.

A screen recording of a code editor is mostly identical pixels from frame to frame, so the encoder stores a keyframe and then tiny descriptions of what moved. A handheld shot of leaves in wind has every pixel changing constantly and nothing to reuse.

This is why "compress to 10 MB" behaves so inconsistently across files, and why grain, confetti, rain and shaky handheld footage are the hardest things to compress. If your footage is in that category, expect to give up resolution earlier than you would for a screen capture.

## CRF versus target bit rate

Encoders offer two ways to ask for quality.

**Constant quality (CRF).** You specify a quality level and the encoder spends whatever bits that needs. Complex scenes get more, simple scenes get fewer, and the result looks consistent throughout. You do not know the final size until it finishes.

**Target bit rate.** You specify the size budget and the encoder fits it, spending the same rate on hard and easy scenes alike. You get a predictable file size and uneven quality.

For archiving or sharing where the size is not fixed, constant quality is the better setting. For an upload limit, target bit rate is the one that answers the actual question. A video compressor that lets you state a target size is doing the second, which is what a hard limit calls for.

> [!WARNING]
> Do not compress an already-compressed export. Each pass encodes the previous pass's artefacts as if they were detail, so quality falls faster than size does. Go back to the original recording and do a single pass from there.

## Audio is worth checking

Audio is frequently left at 320 kbps on a clip where nobody will notice 96 kbps. On a four-minute video that difference is about 6 MB — which, in the example above, was a quarter of the entire budget.

For speech, 64–96 kbps AAC mono is clean. For music, 128–192 kbps stereo. If the video has no meaningful audio at all, removing the track removes its entire contribution.

## A working order

1. Trim to the content that matters.
2. Decide the hard limit and compute the total bit rate budget.
3. Set audio to what the content needs, subtract it.
4. Pick the highest resolution that looks acceptable at the remaining video budget.
5. Reduce frame rate only if the content is static and you are still over.
6. Encode once, from the original.

The [video compressor](/tool/video-compressor) covers steps 4 and 6: it scales the resolution down (never up) and sets the quality, working on the file in the browser tab, so a recording of an internal call gets down to an attachable size without leaving the machine. It does not trim, so if the clip needs cutting, do step 1 first in whatever recorded it.`,
  'extracting-audio-from-video': `You have a recorded call, a lecture or an interview as a video file, and what you actually want is the sound. Maybe for a podcast cut, maybe to transcribe it, maybe because a 900 MB video of a static slide is absurd when the content is a voice.

The audio is already a separate stream inside the container, so getting it out is more like unpacking than converting — as long as you ask for the right output. It is worth knowing this before reaching for an online converter, because uploading a file to one hands over a recording that a copy operation could have produced locally in seconds.

## Copy or convert

The audio in an MP4 is almost always AAC. That gives you two very different operations:

**Copy (remux).** Write the existing AAC stream into an \`.m4a\` or \`.aac\` file. Nothing is decoded, nothing is re-compressed, the result is bit-for-bit the audio that was in the video. It takes about as long as copying a file.

**Convert (re-encode).** Decode the AAC and encode it as something else — MP3, Opus, WAV. This is a second lossy generation if the target is lossy, and takes real time.

Asking for MP3 out of an MP4 is therefore always a re-encode, even though MP3 feels like the "normal" audio format. If nothing downstream specifically demands MP3, taking the M4A is both faster and better.

> [!NOTE]
> An audio extractor that offers "same as source" is offering the copy path. It is the right default unless a specific device or upload only accepts one format.

## WAV does not undo anything

A persistent belief is that converting to WAV recovers quality, because WAV is uncompressed.

It does not. Lossy compression discards information at encode time and there is nothing to bring back. Converting a 128 kbps MP3 to WAV gives you a file roughly ten times the size containing exactly the same damaged audio, stored without further compression.

WAV is useful for two real reasons: it is what editing and processing tools want to work with, because decoding on every operation is wasteful, and it avoids adding another lossy generation when you are going to process the audio repeatedly. Both are about the work ahead, not about the audio behind.

## Choosing a bit rate for speech

Speech is much easier to compress than music, and most extracted audio is speech.

- **64 kbps mono AAC or Opus** — clean for a single voice; an hour is about 28 MB.
- **96 kbps mono** — comfortable headroom, still small.
- **128 kbps stereo** — the default most tools use, and usually wasteful for a recorded call.
- **192 kbps+ stereo** — for music. Nothing about a meeting recording needs this.

Two people talking over a conference call are already mixed into a single channel of information even when the file says stereo, so mono usually halves the size with no loss of anything you would notice.

> [!WARNING]
> Very low bit rates make speech-to-text worse before they make it unintelligible to a human. If the audio is going to be transcribed, keep it at 64 kbps or above, and keep the original sample rate rather than downsampling to 8 kHz.

## Trimming before converting

An hour-long recording of which twelve minutes matter is an hour-long encode. Cutting the section you want first and converting the cut is faster, smaller and avoids a pile of audio you will never listen to.

This matters especially for transcription, where processing time scales with duration. Extracting, trimming and then running speech-to-text on the relevant twelve minutes is a fraction of the work of transcribing the whole thing and searching the result.

## Removing audio instead

The opposite job comes up as often: a clip that needs to be shared without the room's conversation on it, or a screen recording where the microphone caught something it should not have.

Removing the audio track is a container-level operation on the video side — the video stream is copied untouched and the audio stream is simply not written. It is instant and does not degrade the picture.

That is also the safe way to handle a recording with a sensitive few seconds: strip the audio entirely, rather than trusting that nobody turns the volume up.

## A short recipe

1. Need the sound as-is → extract as M4A with stream copy.
2. Need MP3 because something demands it → extract, accept one re-encode, 96 kbps mono for speech.
3. Going to edit it → extract to WAV, work, export once to a lossy format at the end.
4. Going to transcribe it → trim to the relevant part, extract mono at 64–96 kbps, transcribe.
5. Need the video without sound → strip the track, do not re-encode the video.

[MP4 to MP3](/tool/mp4-to-mp3) covers recipes 2 and 4: it takes the soundtrack from an MP4, MOV or WebM file, lets you choose the bit rate and mix down to mono, and works on the local file in the tab. It exports the whole soundtrack, so trim in an audio editor afterwards if you only need a section. For recipe 3, the [audio converter](/tool/audio-converter) writes WAV from a video's soundtrack too. Keeping this local is the difference between preparing an internal recording for transcription and uploading an internal recording to a third party to find out what is in it.`,
  'subtitles-srt-and-burned-in-captions': `Captions arrive in three quite different forms, and the choice between them is usually made by accident at the point of export. It is worth making on purpose, because one of the three is permanent.

## The three forms

**Sidecar file.** A separate \`.srt\` or \`.vtt\` alongside the video. The player loads it and draws the text. It can be switched off, replaced, corrected, translated and read by search engines. This is the form that keeps every option open, and the one that does the accessibility work properly rather than decoratively. Being a plain text file, it is also subject to the usual [encoding traps](/blog/unicode-utf8-and-mojibake): an SRT saved as Windows-1252 and read as UTF-8 turns every accented character into noise.

**Embedded track.** The subtitles live inside the container as their own stream, the way audio does. One file to move around, still switchable off in players that support it. MKV handles this well, MP4 support is patchier, and browsers mostly ignore embedded subtitle tracks entirely.

**Burned in (hardsub).** The text is drawn into the pixels during encoding. It always appears, on every player, in every context, at the size and position you chose. It cannot be turned off, cannot be corrected, cannot be translated and cannot be selected as text — and you cannot get the clean video back without re-encoding from the original.

## What an SRT actually looks like

There is nothing clever in the format, which is why it is easy to fix by hand:

\`\`\`
1
00:00:02,400 --> 00:00:05,120
The deploy finished at four in the morning.

2
00:00:05,300 --> 00:00:08,000
Nobody noticed until the reports ran.
\`\`\`

A cue number, a time range with a comma before the milliseconds, the text, a blank line. WebVTT is nearly the same with a \`WEBVTT\` header and a full stop instead of the comma before the milliseconds.

That similarity is also the usual bug: an SRT with full stops in the timestamps, or a VTT with commas, will be rejected or silently ignored by strict players.

> [!NOTE]
> Because cues are plain text, sync errors are arithmetic rather than editing. If every caption is 1.5 seconds early, adding 1.5 s to every timestamp fixes the file — no re-encoding involved, because the video was never touched.

## When burning in is the right call

Burned-in captions exist for one legitimate reason: platforms that autoplay muted and either do not support subtitle files or do not show them by default. On a feed where the majority of viewers never hear the audio, text that always appears is the whole point.

Outside of that, burning in costs you things worth keeping:

- A typo means re-exporting from the original.
- Translation means a separate encode per language.
- Nothing can index the text, so the spoken content is invisible to search.
- Viewers who need larger text cannot change it.
- The captions cover the picture permanently, including on a phone where they may overlap the interface.

If both are needed — burned in for the feed, sidecar for the site — export the clean master first and produce the burned version from it. Never the other way round.

> [!WARNING]
> Keep the clean master. A burned-in file is the end of the line: extracting the original frames from under the text is not something any tool can do. Every re-cut, re-translation and correction has to start from the version without text on it.

## Auto-generated captions and the edit pass

Speech recognition has become good enough that starting from an automatic transcript is almost always faster than typing one. It is not good enough to publish unedited, and the errors cluster predictably:

- **Proper nouns.** Names of people, products and companies come out phonetically.
- **Numbers.** "Fifteen" and "fifty" are the classic pair, and version numbers, prices and dates are where a caption error becomes a factual error.
- **Punctuation.** Modern models insert it, but sentence boundaries in unscripted speech are genuinely ambiguous.
- **Overlapping speakers.** Two people talking at once tends to produce one confident and wrong sentence.
- **Technical terms and acronyms.** Anything domain-specific will need a pass.

Running speech-to-text to get a timed draft and then correcting those five categories is perhaps ten minutes per recorded hour, against an hour or more of transcribing from scratch.

## Writing captions people can read

- Two lines maximum on screen, roughly 32–42 characters per line.
- A cue should stay up long enough to read: about one second per three words, with a 1.2 s minimum.
- Break lines at natural phrase boundaries, not mid-noun-phrase.
- Identify speakers when it is not obvious who is talking.
- Include meaningful non-speech sound — a door, a laugh, music starting — where it carries information.

These are accessibility requirements as much as style preferences: captions exist first for viewers who cannot hear the audio, and a caption that flashes past unreadably fails that job while technically existing.

## The order that keeps options open

1. Export the clean video master.
2. Generate a draft transcript from the audio.
3. Correct names, numbers and punctuation; fix line lengths and timing.
4. Ship the SRT as a sidecar wherever it is supported.
5. Produce a burned-in version, from the master, only for platforms that need it.

Transcription is the step worth thinking hardest about, because the output is a searchable text copy of everything that was said. If the recording is an internal meeting, a local transcription model is worth the extra setup: the alternative leaves a full transcript of that meeting sitting on someone else's server.

The sidecar is the part that most often needs converting. HTML5 players and YouTube expect WebVTT, while video editors and desktop players expect SRT, and the two differ mainly in the header and the decimal separator in each timestamp. [SRT to VTT](/tool/srt-to-vtt) and [VTT to SRT](/tool/vtt-to-srt) convert between them in the browser, so the transcript stays on your machine.`,
};
