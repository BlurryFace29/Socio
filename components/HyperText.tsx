import React, { memo } from 'react';
import reactStringReplace from 'react-string-replace';

import { allEmbeds } from './embed';

const HyperText = memo(({ children }: { children: string }) => {
  let processedChildren: React.ReactNode[] = [children.trim()];

  allEmbeds.forEach((embed) => {
    processedChildren = reactStringReplace(processedChildren, embed.regex, (match, i) => {
      return embed.Component({ match, index: i })
    }) as React.ReactNode[];
  });

  return <>{processedChildren}</>;
});

HyperText.displayName = 'HyperText';

export default HyperText;
