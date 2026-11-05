# Avatar

A person or an item as a small picture: a photo, otherwise initials from the name on a colour picked from the name, otherwise an icon. A broken photo falls back on its own. `tx-avatar-group` stacks several with an overlap and a `+N`.

```html
<tx-avatar [image]="user.photo" [name]="user.name" />

<tx-avatar-group [max]="3" ariaLabel="Project members">
  @for (member of members; track member.id) {
    <tx-avatar [image]="member.photo" [name]="member.name" />
  }
  <button txAvatarGroupEnd txButton icon="plus" [rounded]="true" aria-label="Invite"></button>
</tx-avatar-group>
```

## Inputs
| Name | Description |
|---|---|
| image | Photo URL; when it is empty or fails to load, initials or the icon show instead |
| name | Person's name: initials, colour, accessible name and title |
| label | Own text instead of initials, e.g. `+3` or `AI` |
| icon | Icon when there is no photo and no name |
| size | `small`, `medium`, `large`, `xlarge` or a number of px (inherits the group) |
| shape | `circle` or `square` (inherits the group) |
| tone | Own colour instead of the one picked from the name: `blue`, `green`, `sky`, `orange`, `purple`, `red` |
| ariaLabel | Accessible name instead of `name`; without both the avatar is decorative |
| max | `tx-avatar-group`: shows this many avatars and a `+N` |
| moreLabel | `tx-avatar-group`: accessible name of `+N` ("N more", translated, by default) |
| dt | Design tokens of this instance (`avatar`) |
| pt | Classes and styles of the parts: `root`, `image`, `label`, `icon`; group: `root`, `more` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| imageError | The photo failed to load (the fallback is already shown) |

## Slots
| Name | Description |
|---|---|
| default | Avatar: extra content, e.g. a badge; group: the avatars |
| txAvatarGroupEnd | `tx-avatar-group`: an element after the avatars, e.g. an add button |
