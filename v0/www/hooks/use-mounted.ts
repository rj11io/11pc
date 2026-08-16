"use client"

import * as React from "react"

/**
 * False while the server renders and during the first browser render, true from
 * then on.
 *
 * Anything that depends on what the browser can do has to render the server's
 * answer first, or the two sets of markup disagree and hydration fails. Two
 * controls need that: the theme toggle cannot know the resolved colour mode
 * until it runs, and the share button cannot know whether the device has a
 * share sheet.
 *
 * There is nothing to subscribe to, so subscribe ignores its listener and hands
 * back an empty cleanup. The work is in the two snapshot arguments below:
 * useSyncExternalStore renders the third one on the server, then re-reads the
 * second once hydration is done.
 */
const subscribe = () => () => {}

export function useMounted() {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
