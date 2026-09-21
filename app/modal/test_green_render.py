import math
import tempfile
import unittest
import wave
import struct
from pathlib import Path
from green_render import render_candidates, ROLES, ARRANGEMENTS, number

class RendererTests(unittest.TestCase):
    def test_rejects_missing_roles(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(ValueError): render_candidates({}, {}, Path(tmp) / "out")
    def test_rejects_nonfinite_timing(self):
        for value in (None, True, float('nan'), float('inf'), "128"):
            with self.assertRaises(ValueError): number({'targetBpm': value}, 'targetBpm', 60, 180)
    def test_real_ffmpeg_three_candidates(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);stems={}
            for i,role in enumerate(ROLES):
                path=root/(str(i)+'.wav')
                with wave.open(str(path),'wb') as output:
                    output.setnchannels(1);output.setsampwidth(2);output.setframerate(22050)
                    output.writeframes(b''.join(struct.pack('<h', int(1500 * math.sin(2*math.pi*(220+i*37)*t/22050))) for t in range(22050*12)))
                stems[role]=path
            recipe={'targetBpm':128,'durationSeconds':8,'leftBpm':124,'rightBpm':128,'leftStartSeconds':0,'rightStartSeconds':0,'leftSemitones':0,'rightSemitones':0}
            result=render_candidates(stems,recipe,root/'out')
            self.assertEqual([r['arrangement'] for r in result], list(ARRANGEMENTS))
            for row in result:
                self.assertAlmostEqual(row['durationSeconds'],8,places=1)
                self.assertTrue(Path(row['path']).is_file())
                self.assertTrue(math.isfinite(row['metrics']['integratedLufs']))
                self.assertLessEqual(row['metrics']['truePeakDb'],-1)
                self.assertNotEqual(row['qualityStatus'],'passed')
                self.assertEqual(row['metrics']['musicalQuality'],'not_evaluated')
            self.assertEqual(len({Path(row['path']).read_bytes() for row in result}),3)
            with self.assertRaises(ValueError): render_candidates(stems,recipe,root/'out')
if __name__=='__main__': unittest.main()
