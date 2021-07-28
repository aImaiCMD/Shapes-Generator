import LZString from 'lz-string';
import React, { useCallback, useState } from 'react';
import Button from 'react-bootstrap/esm/Button';
import Col from 'react-bootstrap/esm/Col';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import ToggleButton from 'react-bootstrap/esm/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/esm/ToggleButtonGroup';
import ReactModal from 'react-modal';
import styles from '../styles/ExportModal.module.scss';
import { ExportObject } from '../types/ExportObject';
import { Point, ProcessedPoints } from '../types/Point';
import { round, toFracString as toStr } from '../utils/common';
import { stopPropagation } from '../utils/element';
import RangeSlider from './RangeSlider';

ReactModal.setAppElement('#root');

interface ExportModalProps {
    openExportModal: (isOpen: boolean) => void
    importStrings: ExportObject[]
    points: ProcessedPoints[]
    isOpen: boolean
    duplicatedPointRange: number
    setDuplicatedPointRange: (value: number) => void
    isNotSaved: React.MutableRefObject<boolean>
}

const ExportModal = ({ openExportModal, importStrings, points, isOpen, duplicatedPointRange, setDuplicatedPointRange, isNotSaved }: ExportModalProps): JSX.Element => {
    const [exportAcc, setExportAcc] = useState<number>(5);
    const [hasNameComment, setHasNameComment] = useState<boolean>(true);
    const [particle, setParticle] = useState<string>('end_rod');
    const [particleSpeed, setParticleSpeed] = useState<number>(0);

    const onExport = useCallback(() => {
        isNotSaved.current = false;
        const importStr = `# [ImportKey]: ${LZString.compressToEncodedURIComponent(JSON.stringify(importStrings))}`;
        const mkCmd = (pos: Point) => `particle ${particle.trim()} ^${toStr(pos[0])} ^ ^${toStr(pos[1])} 0 0 0 ${toStr(particleSpeed)} 1`;
        const content = [importStr, ...points.flatMap(v => [
            ...(hasNameComment ? [`# ${v.name}`] : []),
            ...v.points.map(({ pos: [x, y] }) => mkCmd([round(x, exportAcc), round(y, exportAcc)]))
        ])].join('\n');

        const blob = new File([content], 'particle.mcfunction', { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = 'particle.mcfunction';
        a.click();
    }, [isNotSaved, importStrings, points, particle, particleSpeed, hasNameComment, exportAcc]);

    const onChangeHasNameComment = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setHasNameComment(e.target.value === 'true'), []);
    const onRequestClose = useCallback(() => openExportModal(false), [openExportModal]);

    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            overlayClassName={{
                base: styles['overlay'],
                afterOpen: styles['after'],
                beforeClose: styles['before']
            }}
            className={{
                base: styles['content'],
                afterOpen: styles['after'],
                beforeClose: styles['before']
            }}
        >
            <Container fluid className={styles['container']}>
                <Row noGutters>
                    <Col className={styles['col']}>
                        <div className={styles['text']}>出力データを図形名で区切る</div>
                        <ToggleButtonGroup type="radio" name="options" defaultValue={hasNameComment.toString()} value={hasNameComment.toString()}>
                            <ToggleButton className={styles['button']} value={'false'} onChange={onChangeHasNameComment}>
                                OFF
                            </ToggleButton>
                            <ToggleButton className={styles['button']} value={'true'} onChange={onChangeHasNameComment}>
                                ON
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Col>
                </Row>
                <Row><Col><hr className={styles['line']} /></Col></Row>
                <Row noGutters>
                    <Col className={styles['col']}>
                        <div className={styles['text']}>Particle</div>
                        <input className={styles['input']} onChange={e => setParticle(e.target.value)} value={particle} onKeyDown={stopPropagation} />
                    </Col>
                </Row>
                <Row><Col><hr className={styles['line']} /></Col></Row>
                <Row noGutters>
                    <Col className={styles['col']}>
                        <div className={styles['text']}>Particle: Speed</div>
                        <RangeSlider
                            min={0} step={0.01} max={1}
                            value={particleSpeed}
                            setValue={setParticleSpeed}
                        />
                    </Col>
                </Row>
                <Row><Col><hr className={styles['line']} /></Col></Row>
                <Row noGutters>
                    <Col className={styles['col']}>
                        <div className={styles['text']}>出力の精度</div>
                        <RangeSlider
                            min={1} step={1} max={5}
                            value={exportAcc}
                            setValue={setExportAcc}
                            unit="桁"
                        />
                    </Col>
                </Row>
                <Row><Col><hr className={styles['line']} /></Col></Row>
                <Row noGutters>
                    <Col className={styles['col']}>
                        <div className={styles['text']}>重複点の削除</div>
                        <RangeSlider
                            min={0} step={0.05} max={0.5}
                            value={duplicatedPointRange}
                            setValue={setDuplicatedPointRange}
                            unit="m"
                            spIndicateZeroVal="OFF"
                        />
                    </Col>
                </Row>
                <Row><Col><hr className={styles['line']} /></Col></Row>
                <Row noGutters>
                    <Col className={styles['col']}>
                        <div className={styles['text']}>出力されるParticle数: {points.reduce((s, v) => s + v.points.length, 0)}</div>
                    </Col>
                </Row>
                <Row><Col><hr className={styles['line']} /></Col></Row>
                <Row noGutters>
                    <Col className={styles['col']} xl={6} lg={6} md={6} sm={12} xs={12}>
                        <Button onClick={onRequestClose}>Cancel</Button>
                    </Col>
                    <Col className={styles['col']} xl={6} lg={6} md={6} sm={12} xs={12}>
                        <Button onClick={onExport}>Export</Button>
                    </Col>
                </Row>
            </Container>
        </ReactModal>
    );
};

export default React.memo(ExportModal);
