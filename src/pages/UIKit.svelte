<script lang="typescript">
	import Breadcrumb from "../components/interface/breadcrumb/Breadcrumb.svelte";
	import BreadcrumbItem from "../components/interface/breadcrumb/BreadcrumbItem.svelte";
	import Button from "../components/interface/button/Button.svelte";
	import DimmedButton from "../components/interface/button/DimmedButton.svelte";
	import OutlineButton from "../components/interface/button/OutlineButton.svelte";
	import TextButton from "../components/interface/button/TextButton.svelte";
	import Card from "../components/interface/card/Card.svelte";
	import IconButton from "../components/interface/icon_button/IconButton.svelte";
	import LineSeparator from "../components/interface/line_separator/LineSeparator.svelte";
	import SvgIcon from "../components/interface/svg_icon/SVGIcon.svelte";
	import { CurrentTheme } from "../themes/CurrentTheme";
	import { DarkTheme } from "../themes/dark.theme";
	import { LightInterfaceTheme } from "../themes/light.theme";
	import { fade } from "svelte/transition";
	import Chip from "../components/interface/chip/Chip.svelte";
	import CircularFrame from "../components/interface/circular_frame/CircularFrame.svelte";
	import ContextMenu from "../components/interface/context_menu/ContextMenu.svelte";
	import type { ContextMenuOptions } from "../components/interface/context_menu/ContextMenuOptions";
	import Dropdown from "../components/interface/dropdown/Dropdown.svelte";
	import DropdownItem from "../components/interface/dropdown/item/DropdownItem.svelte";
	import ExpandableContainer from "../components/interface/expandable_container/ExpandableContainer.svelte";
	import FloatingActionButton from "../components/interface/floating_action_button/FloatingActionButton.svelte";
	import Popup from "../components/interface/popup/Popup.svelte";
	import UiGroup from "../components/interface/ui_group/UIGroup.svelte";

	const CMItems: ContextMenuOptions["items"] = [
		{
			icon: "/img/icons/menu.svg",
			title: "Click Me",
			onClick() {
				alert("clicked me!");
			},
		},
		{
			title: "NO! Click Me",
			onClick() {
				alert("clicked me!");
			},
		},
		{
			title: "Tou cannot click me ",
			enabled: false,
			onClick() {
				console.log("oopsie");
			},
		},
		{
			title: "Im a submenu",
			spawn_submenu: true,
			items: [
				{
					icon: "/img/icons/menu.svg",
					title: "Click Me",
					onClick() {
						alert("clicked me!");
					},
				},
			],
		},
		{
			title: "im a group!",
			items: [
				{
					icon: "/img/icons/menu.svg",
					title: "Click Me",
					onClick() {
						alert("clicked me!");
					},
				},
			],
		},
	];

	let cmVisibility = false;

	let popupVisibility = false;

	let cmPosition = {
		x: "0",
		y: "0",
	};

	let fabContainer: HTMLElement;

	function openContextMenu(ev: MouseEvent) {
		ev.preventDefault();
		cmPosition = {
			x: ev.clientX + "px",
			y: ev.clientY + "px",
		};
		cmVisibility = true;
	}
</script>

<main transition:fade>
	<div class="header">
		<h1>
			<IconButton
				src="/img/icons/back.svg"
				shape="rounded-square"
				icon_style={{ margin: "0" }}
				on:click={() => {
					window.history.go(-1);
				}}
			/><SvgIcon src="/img/harmony.logo.svg" /> Harmony UI Kit
		</h1>
		<DimmedButton
			on:click={() => {
				if ($CurrentTheme.name === "light") {
					$CurrentTheme = DarkTheme;
				} else {
					$CurrentTheme = LightInterfaceTheme;
				}
			}}>Change theme</DimmedButton
		>
	</div>
	<LineSeparator />
	<h3>Interface Components</h3>
	<br />
	<sector class="components">
		<!-- Breadcrumb -->
		<div class="interface-display">
			<div class="component-display">
				<Breadcrumb separator="▶️" styles={{ width: "100%" }}>
					<BreadcrumbItem class="clickable">
						<SvgIcon
							src="/img/icons/menu.svg"
							styles={{ margin: "0 7px 0 0" }}
						/> Menu
					</BreadcrumbItem>
					<BreadcrumbItem class="clickable">Submenu</BreadcrumbItem>
					<BreadcrumbItem>Another Submenu</BreadcrumbItem>
				</Breadcrumb>
			</div>
			<div class="component-properties">
				<h3>Breadcrumb</h3>
				<h4>➡️ Properties</h4>
				<ul>
					<li>
						separator: which glyph shall be used to separate items inside the
						Breadcrumb
					</li>
				</ul>
				<h4>➡️ Styling</h4>
				<ul>
					<li>
						<b>background_color:</b> color to be used as the breadcrumb background,
						directly inserted into 'background-color' css property, accepts all the
						values that are valid background colors
					</li>
					<li>
						<b>separator_color:</b> color to be used as the separator color, directly
						inserted into 'color' css property, accepts all the values that are valid
						colors
					</li>
					<li>
						<b>separator_color:</b> font size to be used for the separator, directly
						inserted into 'font-size' css property, accepts all the values that are
						valid font sizes
					</li>
					<li>
						<b>separator_weight:</b> font weight to be used for the separator, directly
						inserted into 'font-weight' css property, accepts all the values that
						are valid font weight (number | 'bold' | 'nomral' | 'thin' | 'lighter'
						| ...)
					</li>
					<li>
						<b>fade_ratio:</b> increasingly decrements opacity when closer to the
						origin, must be a number between 0-1, 0 means 'no fading' 1 means only
						the last element shall be visible
					</li>
				</ul>
			</div>
		</div>

		<!-- Button -->
		<div class="interface-display">
			<div class="component-display">
				<Button>Button</Button>
				<DimmedButton>Dimmed Button</DimmedButton>
				<br />
				<OutlineButton>Outline Button</OutlineButton>
				<TextButton>Text Button</TextButton>
				<br />

				<UiGroup>
					<Button>Button 1</Button>
					<Button>Button 2</Button>
					<IconButton src="/img/icons/reload.svg" />
				</UiGroup>

				<UiGroup>
					<Button>Button 1</Button>
					<Button>Button 3</Button>
					<OutlineButton>Outline Button</OutlineButton>
					<Dropdown placeholder="Pick something">
						<DropdownItem title="Something"></DropdownItem>
						<DropdownItem title="Something good"></DropdownItem>
						<DropdownItem title="Something really good"></DropdownItem>
					</Dropdown>
				</UiGroup>
			</div>
			<div class="component-properties">
				<h3>Button</h3>
				<h4>➡️ Variations</h4>
				All of the variations are just styling modifications of the Button class,
				they posses the same functionality and expose the same DOM Events
				<ul>
					<li>
						<b>Filled Button:</b> is the default styling tor the 'Button' component,
						filled button using the default box-shadow property
					</li>
					<li>
						<b>Dimmed Button:</b> filled button with less accent, good for secondary
						actions
					</li>
					<li>
						<b>Outline Button:</b> not filled button with a soft border, has no elevation
						attached
					</li>
					<li>
						<b>Text Button:</b> Text based button, has visual cues signaling that
						it is a clickable element
					</li>
				</ul>
				<h4>➡️ Styling</h4>
				<ul>
					<li>
						<b>background_color:</b> color to be used as the button background, directly
						inserted into 'background-color' css property, accepts all the values
						that are valid background colors
					</li>
					<li>
						<b>text_color:</b> color to be used as the button text color, directly
						inserted into 'text-color' css property, accepts all the values that
						are valid colors
					</li>
					<li>
						<b>padding:</b> button padding, use it as the shorthand css property
						for 'padding'
					</li>
					<li>
						<b>border:</b> button border, use it as the shorthand css property for
						'border'
					</li>
					<li>
						<b>box-shadow:</b> button box shadow, use it as the shorthand css property
						for 'box-shadow'
					</li>
					<li>
						<b>width:</b> set a width to be used inside the button, by default it
						assumes an 'auto' width, to wrap its contents
					</li>
				</ul>
			</div>
		</div>

		<!-- Card -->
		<div class="interface-display" name="card">
			<div class="component-display">
				<Card styles={{ image_max_height: "100px" }}>
					<img
						src="/img/card_image.jpeg"
						class="image"
						slot="image"
						alt="card header"
					/>
					<span slot="title">Title of the card</span>
					<span slot="description">Description of the card</span>
					<span slot="actions">Actions of the card!</span>
				</Card>
			</div>
			<div class="component-properties">
				<h3>Card</h3>
				<h4>➡️ Slots</h4>
				<ul>
					<li>
						<b>image:</b> place an element with 100% width at the top of the card
					</li>
					<li>
						<b>title:</b> place an element as the title of the card, has increased
						font size and weight
					</li>
					<li>
						<b>description (default slot):</b> place an element without font modifications
					</li>
					<li>
						<b>action:</b> place elements at the bottom of the card, usually interactive
						elements are placed inside this are
					</li>
				</ul>
				<h4>➡️ Styling</h4>
				<ul>
					<li>
						<b>background_color:</b> color to be used as the card background, directly
						inserted into 'background-color' css property, accepts all the values
						that are valid background colors
					</li>
					<li>
						<b>separator_color:</b> color to be used as the separator color, directly
						inserted into 'color' css property, accepts all the values that are valid
						colors
					</li>
					<li>
						<b>separator_color:</b> font size to be used for the separator, directly
						inserted into 'font-size' css property, accepts all the values that are
						valid font sizes
					</li>
					<li>
						<b>separator_weight:</b> font weight to be used for the separator, directly
						inserted into 'font-weight' css property, accepts all the values that
						are valid font weight (number | 'bold' | 'nomral' | 'thin' | 'lighter'
						| ...)
					</li>
					<li>
						<b>fade_ratio:</b> increasingly decrements opacity when closer to the
						origin, must be a number between 0-1, 0 means 'no fading' 1 means only
						the last element shall be visible
					</li>
				</ul>
			</div>
		</div>

		<!-- Chip -->
		<div class="interface-display">
			<div class="component-display">
				<Chip>Chip</Chip>
				<Chip
					styles={{
						color: "var(--secondary-color)",
						background_color: "var(--secondary-color-25)",
					}}>Colored Chip</Chip
				>
			</div>
			<div class="component-properties">
				<h3>Chip</h3>
				<h4>➡️ Styling</h4>
				<ul>
					<li>
						<b>background_color:</b> color to be used as the button background, directly
						inserted into 'background-color' css property, accepts all the values
						that are valid background colors
					</li>
					<li>
						<b>text_color:</b> color to be used as the button text color and border
						color, directly inserted into 'text-color' ans 'border-color' css property,
						accepts all the values that are valid colors
					</li>
					<li>
						<b>padding:</b> button padding, use it as the shorthand css property
						for 'padding'
					</li>
					<li>
						<b>border:</b> button border, use it as the shorthand css property for
						'border'
					</li>
					<li>
						<b>width:</b> set a width to be used inside the button, by default it
						assumes an 'auto' width, to wrap its contents
					</li>
				</ul>
			</div>
		</div>

		<!-- Circular Frame -->
		<div class="interface-display">
			<div class="component-display">
				<CircularFrame style={{ status_color: "transparent" }} size="60px">
					<img src="/img/card_image.jpeg" class="image" alt="card header" />
				</CircularFrame>
				<CircularFrame size="60px">
					<img src="/img/card_image.jpeg" class="image" alt="card header" />
				</CircularFrame>
				<CircularFrame size="60px">
					<img src="/img/card_image.jpeg" class="image" alt="card header" />
					<span slot="status"> 10 </span>
				</CircularFrame>
				<CircularFrame size="60px">
					<img src="/img/card_image.jpeg" class="image" alt="card header" />

					<SvgIcon
						class="clickable"
						slot="status"
						src="/img/icons/reload.svg"
						styles={{ size: "12px", color: "white" }}
					/>
				</CircularFrame>
			</div>
			<div class="component-properties">
				<h3>Circular Frame</h3>
				<h4>➡️ Styling</h4>
				<ul>
					<li>
						<b>background_color:</b> color to be used as the button background, directly
						inserted into 'background-color' css property, accepts all the values
						that are valid background colors
					</li>
					<li>
						<b>text_color:</b> color to be used as the button text color and border
						color, directly inserted into 'text-color' ans 'border-color' css property,
						accepts all the values that are valid colors
					</li>
					<li>
						<b>padding:</b> button padding, use it as the shorthand css property
						for 'padding'
					</li>
					<li>
						<b>border:</b> button border, use it as the shorthand css property for
						'border'
					</li>
					<li>
						<b>width:</b> set a width to be used inside the button, by default it
						assumes an 'auto' width, to wrap its contents
					</li>
				</ul>
			</div>
		</div>

		<!-- Context Menu-->
		<div class="interface-display">
			<div class="component-display">
				<Button on:contextmenu={openContextMenu}>Right click me</Button>
				<ContextMenu
					title="Context Menu"
					bind:visible={cmVisibility}
					items={CMItems}
					bind:position={cmPosition}
				/>
			</div>
			<div class="component-properties">
				<h3>Context Menu</h3>
				<h4>➡️ Styling</h4>
				<ul>
					<li>
						<b>background_color:</b> color to be used as the button background, directly
						inserted into 'background-color' css property, accepts all the values
						that are valid background colors
					</li>
					<li>
						<b>text_color:</b> color to be used as the button text color and border
						color, directly inserted into 'text-color' ans 'border-color' css property,
						accepts all the values that are valid colors
					</li>
					<li>
						<b>padding:</b> button padding, use it as the shorthand css property
						for 'padding'
					</li>
					<li>
						<b>border:</b> button border, use it as the shorthand css property for
						'border'
					</li>
					<li>
						<b>width:</b> set a width to be used inside the button, by default it
						assumes an 'auto' width, to wrap its contents
					</li>
				</ul>
			</div>
		</div>

		<!-- Dropdown -->
		<div class="interface-display">
			<div class="component-display">
				<Dropdown placeholder="Pick something">
					<DropdownItem icon="/img/icons/reload.svg" title="Item 1" />
					<DropdownItem title="Item 2" />
				</Dropdown>
			</div>
			<div class="component-properties">
				<h3>Dropdown Menu</h3>
				<h4>➡️ Styling</h4>
				<ul>
					<li>
						<b>background_color:</b> color to be used as the button background, directly
						inserted into 'background-color' css property, accepts all the values
						that are valid background colors
					</li>
					<li>
						<b>text_color:</b> color to be used as the button text color and border
						color, directly inserted into 'text-color' ans 'border-color' css property,
						accepts all the values that are valid colors
					</li>
					<li>
						<b>padding:</b> button padding, use it as the shorthand css property
						for 'padding'
					</li>
					<li>
						<b>border:</b> button border, use it as the shorthand css property for
						'border'
					</li>
					<li>
						<b>width:</b> set a width to be used inside the button, by default it
						assumes an 'auto' width, to wrap its contents
					</li>
				</ul>
			</div>
		</div>

		<!-- Expandable container -->
		<div class="interface-display">
			<div class="component-display">
				<ExpandableContainer placeholder="I can expand into great lengths!">
					<LineSeparator />
					And with text inside me I might explain the whole word to those who should
					listen!<br />
					Not too much creativity to keep goin tough;
				</ExpandableContainer>
			</div>
			<div class="component-properties">
				<h3>Expandable Container</h3>
				<h4>➡️ Styling</h4>
				<ul>
					<li>
						<b>background_color:</b> color to be used as the button background, directly
						inserted into 'background-color' css property, accepts all the values
						that are valid background colors
					</li>
					<li>
						<b>text_color:</b> color to be used as the button text color and border
						color, directly inserted into 'text-color' ans 'border-color' css property,
						accepts all the values that are valid colors
					</li>
					<li>
						<b>padding:</b> button padding, use it as the shorthand css property
						for 'padding'
					</li>
					<li>
						<b>border:</b> button border, use it as the shorthand css property for
						'border'
					</li>
					<li>
						<b>width:</b> set a width to be used inside the button, by default it
						assumes an 'auto' width, to wrap its contents
					</li>
				</ul>
			</div>
		</div>

		<!-- Floating Action Button -->
		<div class="interface-display" bind:this={fabContainer}>
			<div class="component-display">
				<h2>Look at the bottom of the page!</h2>
				<FloatingActionButton
					title="FAB"
					bind:bindVisibilityTo={fabContainer}
					icon="/img/icons/save.svg"
				/>
			</div>
			<div class="component-properties">
				<h3>Floating Action Button</h3>
				<h4>➡️ Styling</h4>
				<ul>
					<li>
						<b>background_color:</b> color to be used as the button background, directly
						inserted into 'background-color' css property, accepts all the values
						that are valid background colors
					</li>
					<li>
						<b>text_color:</b> color to be used as the button text color and border
						color, directly inserted into 'text-color' ans 'border-color' css property,
						accepts all the values that are valid colors
					</li>
					<li>
						<b>padding:</b> button padding, use it as the shorthand css property
						for 'padding'
					</li>
					<li>
						<b>border:</b> button border, use it as the shorthand css property for
						'border'
					</li>
					<li>
						<b>width:</b> set a width to be used inside the button, by default it
						assumes an 'auto' width, to wrap its contents
					</li>
				</ul>
			</div>
		</div>

		<!-- Icon Button-->
		<div class="interface-display">
			<div class="component-display">
				<IconButton src="/img/icons/save.svg" />
			</div>
			<div class="component-properties">
				<h3>Icon Button</h3>
				<h4>➡️ Styling</h4>
				<ul>
					<li>
						<b>background_color:</b> color to be used as the button background, directly
						inserted into 'background-color' css property, accepts all the values
						that are valid background colors
					</li>
					<li>
						<b>text_color:</b> color to be used as the button text color and border
						color, directly inserted into 'text-color' ans 'border-color' css property,
						accepts all the values that are valid colors
					</li>
					<li>
						<b>padding:</b> button padding, use it as the shorthand css property
						for 'padding'
					</li>
					<li>
						<b>border:</b> button border, use it as the shorthand css property for
						'border'
					</li>
					<li>
						<b>width:</b> set a width to be used inside the button, by default it
						assumes an 'auto' width, to wrap its contents
					</li>
				</ul>
			</div>
		</div>

		<!-- Line Separator-->
		<div class="interface-display" style="grid-column: 1 / 3;">
			<h3>Line Separator</h3>
			<LineSeparator />
			That's it
		</div>

		<!-- Popup -->
		<div class="interface-display">
			<div class="component-display">
				<Button on:click={() => (popupVisibility = true)}>
					<SvgIcon
						src="/img/icons/open.svg"
						styles={{ color: "var(--text-on-main-color)" }}
					/> Click me to open
				</Button>

				<Popup style={{ width: "300px" }} bind:visible={popupVisibility}>
					<div slot="header">Popup header</div>
					Popup content
				</Popup>
			</div>
			<div class="component-properties">
				<h3>Popup</h3>
				<h4>➡️ Styling</h4>
				<ul>
					<li>
						<b>background_color:</b> color to be used as the button background, directly
						inserted into 'background-color' css property, accepts all the values
						that are valid background colors
					</li>
					<li>
						<b>text_color:</b> color to be used as the button text color and border
						color, directly inserted into 'text-color' ans 'border-color' css property,
						accepts all the values that are valid colors
					</li>
					<li>
						<b>padding:</b> button padding, use it as the shorthand css property
						for 'padding'
					</li>
					<li>
						<b>border:</b> button border, use it as the shorthand css property for
						'border'
					</li>
					<li>
						<b>width:</b> set a width to be used inside the button, by default it
						assumes an 'auto' width, to wrap its contents
					</li>
				</ul>
			</div>
		</div>
		<div><h4>Progress Bar</h4></div>
		<div><h4>Progress Ring</h4></div>
		<div><h4>Resizable Container</h4></div>
		<div><h4>SVG Icon</h4></div>
		<div><h4>Tab</h4></div>
		<div><h4>Tooltip</h4></div>
	</sector>
</main>

<style>
	main {
		position: relative;
		margin: 0;
		padding: 1em 1.5em;
		box-sizing: border-box;
	}

	.header {
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-rows: auto;
	}
	h1 {
		color: var(--main-color);
		font-size: 2em;
		font-weight: 300;
		padding: 0;
		margin: 0;
		width: auto;
		margin-bottom: 5px;
	}

	h3 {
		color: var(--secondary-color);
		padding: 0;
		margin: 0;
	}

	li {
		margin-bottom: 6px;
	}

	sector.components {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto;
		grid-auto-rows: auto;
		row-gap: 20px;
		column-gap: 25px;
		box-sizing: border-box;
		padding: 10px 0;
	}
	.interface-display {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto 1fr;
		column-gap: 20px;
		background-color: var(--transparent-background-70);
		border-radius: 4px;
		padding: 1em 1.5em;
	}

	.component-display {
		line-height: 1.5em;
	}

	@media (min-width: 640px) {
		div {
			max-width: none;
		}
	}

	@media screen and (max-width: 850px) {
		sector.components {
			grid-template-columns: 1fr;
		}
		.component-display {
			text-align: center;
			justify-self: center;
		}
	}
</style>
