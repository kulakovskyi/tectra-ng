# Avatar

A person or an item as a small picture: a photo, otherwise initials from the name on a colour picked from the name, otherwise an icon. A broken photo falls back on its own. `tx-avatar-group` stacks several with an overlap, shows each name in a tooltip, and a `+N` button opens a popover that lists the hidden people.

```html
<tx-avatar [image]="user.photo" [name]="user.name" />

<tx-avatar-group [max]="3" addButton addLabel="Invite" ariaLabel="Project members" (add)="invite()">
  @for (member of members; track member.id) {
    <tx-avatar [image]="member.photo" [name]="member.name" />
  }
</tx-avatar-group>
```

App-wide settings — an own initials rule, placeholder photos that show initials instead, one tone for every avatar with initials:

```ts
provideTxAvatar({
  initials: (name) => (name.includes(' ') ? avatarInitials(name) : name.slice(0, 2).toUpperCase()),
  placeholderImages: ['/assets/blank.png', /\/default-avatar\.\w+$/],
  tone: 'solid',
})
```

## Inputs
| Name | Description |
|---|---|
| image | Photo URL; when it is empty, a placeholder of `provideTxAvatar` or fails to load, initials or the icon show instead |
| name | Person's name: initials, colour, accessible name and title |
| label | Own text instead of initials, e.g. `+3` or `AI` |
| icon | Icon when there is no photo and no name |
| size | `small`, `medium`, `large`, `xlarge`, a number of px (inherits the group), or `fill`: the whole box of the parent (give it a width and height), with the text scaled to it |
| shape | `circle` or `square` (inherits the group) |
| tone | Own colour instead of the one picked from the name (or the `tone` of `provideTxAvatar`): `blue`, `green`, `sky`, `orange`, `purple`, `red`, or `solid` (the primary colour) |
| ariaLabel | Accessible name instead of `name`; without both the avatar is decorative |
| tooltip | Shows `name` (or `ariaLabel`) in a tooltip instead of the native title; `none` shows no hint at all (neither tooltip nor title); inherits `tooltips` of the group, off on its own |
| tooltipPlacement | Where the name tooltip opens (`top` by default) |
| max | `tx-avatar-group`: shows this many avatars and a `+N` button; it opens a popover that lists the hidden ones (avatar + name) |
| tooltips | `tx-avatar-group`: name tooltip on every avatar (on by default) |
| morePopover | `tx-avatar-group`: `+N` is a button with the list of hidden people (on by default); `false` keeps it a plain label, e.g. inside a select trigger |
| addButton | `tx-avatar-group`: a dashed add button of the avatar size at the end; emits `add` |
| addLabel | `tx-avatar-group`: tooltip and accessible name of the add button ("Add a person", translated, by default) |
| moreLabel | `tx-avatar-group`: accessible name of `+N` and of its popover ("N more", translated, by default) |
| dt | Design tokens of this instance (`avatar`); on a group they also reach the list of hidden people |
| pt | Classes and styles of the parts: `root`, `image`, `label`, `icon`; group: `root`, `more`, `add`, `list`, `item`, `name` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| imageError | The photo failed to load (the fallback is already shown) |
| add | `tx-avatar-group`: the add button was clicked |

## Slots
| Name | Description |
|---|---|
| default | Avatar: extra content, e.g. a badge; group: the avatars |
| txAvatarGroupEnd | `tx-avatar-group`: an element after the avatars, e.g. an add button |

## Providers
| Name | Description |
|---|---|
| provideTxAvatar({ initials?, placeholderImages?, tone? }) | App-wide settings of every avatar: `initials(name)` turns a name into initials, `placeholderImages` (texts or patterns) are blank photos that show initials, `tone` is one colour for every avatar with initials |

## Functions
| Name | Description |
|---|---|
| avatarInitials(name) | The default initials rule: first letters of the first and the last word (`Olena Kovalenko` → `OK`, `admin` → `A`) |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves to the `+N` button of a group, then to its add button |
| Enter / Space | `+N`: opens or closes the list of hidden people |
| Escape | Closes the list and returns focus to `+N` |
