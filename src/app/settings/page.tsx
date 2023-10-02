'use client';
import {isMobile} from "react-device-detect";

import {Accordion, AccordionItem, Button, ButtonGroup, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem} from "@nextui-org/react";

export default function Root() {

    const contentFilteringList = ['Explicit Sexual Images', 'Other Nudity', 'Sexually Suggestive', 'Violent / Bloody', 'Hate Group Iconography', 'Spam', 'Impersonation']
    return(
        <>
            <div className={'h-full w-full bg-white'}>
                設定
                <Accordion>
                    <AccordionItem key="general" aria-label="Accordion 1" title="Accordion 1">
                        <div>
                            <div>Theme Color</div>
                            <ButtonGroup>
                                <Button>System</Button>
                                <Button>Light</Button>
                                <Button>Dark</Button>
                            </ButtonGroup>
                        </div>
                        <div className={'flex'}>
                            <div>Language</div>
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button
                                        variant="bordered"
                                    >
                                        Select Language
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Select Languages">
                                    <DropdownItem key="japanese">日本語</DropdownItem>
                                    <DropdownItem key="english">English</DropdownItem>
                                    <DropdownItem key="hoge">hoge</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    </AccordionItem>
                    <AccordionItem key="contentFiltering" aria-label="Accordion 1" title="Content Filtering">
                        {contentFilteringList.map((item, index) => (
                            <div key={index}
                                className={'flex justify-between items-center'}
                            >
                                <div>{item}</div>
                                <div className={''}>
                                    <ButtonGroup>
                                        <Button>Hide</Button>
                                        <Button>Warn</Button>
                                        <Button>Show</Button>
                                    </ButtonGroup>
                                </div>
                            </div>
                        ))}
                    </AccordionItem>
                </Accordion>
            </div>
        </>
    )
}